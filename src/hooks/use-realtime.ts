'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useKanbanStore } from '@/stores/kanban-store';
import type { Task } from '@/types/kanban';

const REALTIME_PORT = 3003;

export function useRealtime(projectId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  
  const {
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addNotification,
    setIsRealtimeConnected,
    currentUser,
  } = useKanbanStore();
  
  // Connect to WebSocket server
  useEffect(() => {
    if (!projectId) return;
    
    const socket = io('/', {
      path: '/socket.io',
      query: {
        XTransformPort: REALTIME_PORT,
      },
      transports: ['websocket', 'polling'],
    });
    
    socketRef.current = socket;
    
    // Connection events
    socket.on('connect', () => {
      console.log('🔗 Connected to real-time server');
      setIsRealtimeConnected(true);
      socket.emit('join-project', projectId);
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from real-time server');
      setIsRealtimeConnected(false);
    });
    
    // ==================== TASK EVENTS ====================
    
    socket.on('task:created', (task: Task) => {
      console.log('📥 Task created via socket:', task.id);
      addTask(task);
    });
    
    socket.on('task:updated', (task: Task) => {
      console.log('📝 Task updated via socket:', task.id);
      updateTask(task.id, task);
    });
    
    socket.on('task:deleted', ({ taskId }: { taskId: string }) => {
      console.log('🗑️ Task deleted via socket:', taskId);
      deleteTask(taskId);
    });
    
    socket.on('task:moved', (data: { 
      taskId: string; 
      status: string;
      order: number;
    }) => {
      console.log('🔄 Task moved via socket:', data.taskId);
      moveTask(data.taskId, data.status as any, data.order);
    });
    
    socket.on('tasks:reordered', (data: {
      tasks: Task[];
      status: string;
    }) => {
      console.log('📊 Tasks reordered via socket');
      data.tasks.forEach((task) => {
        updateTask(task.id, { order: task.order, status: task.status as any });
      });
    });
    
    // ==================== NOTIFICATION EVENTS ====================
    
    if (currentUser) {
      socket.on(`notification:${currentUser.id}`, (notification: any) => {
        console.log('🔔 New notification:', notification);
        addNotification(notification);
      });
    }
    
    return () => {
      socket.emit('leave-project', projectId);
      socket.disconnect();
      socketRef.current = null;
      setIsRealtimeConnected(false);
    };
  }, [projectId, currentUser?.id, addTask, updateTask, deleteTask, moveTask, addNotification, setIsRealtimeConnected]);
  
  // ==================== EMIT FUNCTIONS ====================
  
  const emitTaskCreated = useCallback((task: Task) => {
    if (!projectId) return;
    socketRef.current?.emit('task:created', { task, projectId });
  }, [projectId]);
  
  const emitTaskUpdated = useCallback((task: Task) => {
    if (!projectId) return;
    socketRef.current?.emit('task:updated', { task, projectId });
  }, [projectId]);
  
  const emitTaskDeleted = useCallback((taskId: string) => {
    if (!projectId) return;
    socketRef.current?.emit('task:deleted', { taskId, projectId });
  }, [projectId]);
  
  const emitTaskMoved = useCallback((taskId: string, status: string, order: number) => {
    if (!projectId) return;
    socketRef.current?.emit('task:moved', { taskId, projectId, status, order });
  }, [projectId]);
  
  const emitTasksReordered = useCallback((tasks: Task[], status: string) => {
    if (!projectId) return;
    socketRef.current?.emit('tasks:reordered', { tasks, projectId, status });
  }, [projectId]);
  
  return {
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskMoved,
    emitTasksReordered,
  };
}
