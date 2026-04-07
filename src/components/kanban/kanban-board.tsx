'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useKanbanStore } from '@/stores/kanban-store';
import { TaskColumn } from './task-column';
import { TaskCard } from './task-card';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  Loader2,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Task, TaskStatus } from '@/types/kanban';

// Column configuration
const columns = [
  {
    status: 'PENDING' as TaskStatus,
    title: 'قيد الانتظار',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500',
    borderColor: 'border-slate-400',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    status: 'IN_PROGRESS' as TaskStatus,
    title: 'قيد التنفيذ',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-400',
    icon: <Loader2 className="w-4 h-4" />,
  },
  {
    status: 'IN_REVIEW' as TaskStatus,
    title: 'قيد المراجعة',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500',
    borderColor: 'border-violet-400',
    icon: <Eye className="w-4 h-4" />,
  },
  {
    status: 'DONE' as TaskStatus,
    title: 'مكتمل',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

export function KanbanBoard() {
  const {
    tasks,
    updateTask,
    moveTask,
    currentProject,
  } = useKanbanStore();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Find task by ID
  const findTaskById = useCallback((id: string) => {
    return tasks.find((task) => task.id === id);
  }, [tasks]);
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task || null);
  }, [findTaskById]);
  
  // Handle drag over (for moving between columns)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = findTaskById(activeId);
    if (!activeTask) return;
    
    // Check if dropping over a column
    const isOverColumn = columns.some(col => col.status === overId);
    
    if (isOverColumn && activeTask.status !== overId) {
      // Move to new column
      const newStatus = overId as TaskStatus;
      const tasksInNewColumn = tasks.filter(t => t.status === newStatus);
      const newOrder = tasksInNewColumn.length;
      
      moveTask(activeId, newStatus, newOrder);
    }
  }, [findTaskById, tasks, moveTask]);
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;
    
    const activeTask = findTaskById(activeId);
    const overTask = findTaskById(overId);
    
    if (!activeTask) return;
    
    // If dropping over another task in the same column
    if (overTask && overTask.status === activeTask.status) {
      const columnTasks = tasks
        .filter(t => t.status === activeTask.status)
        .sort((a, b) => a.order - b.order);
      
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
      
      // Update order for all tasks in the column
      reorderedTasks.forEach((task, index) => {
        updateTask(task.id, { order: index });
      });
    }
    // If dropping over a column
    else if (!overTask) {
      const isOverColumn = columns.some(col => col.status === overId);
      if (isOverColumn && activeTask.status !== overId) {
        const newStatus = overId as TaskStatus;
        const tasksInNewColumn = tasks.filter(t => t.status === newStatus);
        moveTask(activeId, newStatus, tasksInNewColumn.length);
      }
    }
    // If dropping over a task in a different column
    else if (overTask && overTask.status !== activeTask.status) {
      moveTask(activeId, overTask.status, overTask.order);
      // Shift other tasks
      tasks
        .filter(t => t.status === overTask.status && t.id !== activeId)
        .forEach(t => {
          if (t.order >= overTask.order) {
            updateTask(t.id, { order: t.order + 1 });
          }
        });
    }
  }, [findTaskById, tasks, moveTask, updateTask]);
  
  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">لا يوجد مشروع محدد</h2>
          <p className="text-muted-foreground">اختر مشروعاً من القائمة الجانبية</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-4 md:p-6 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full">
          {columns.map((column) => (
            <TaskColumn
              key={column.status}
              status={column.status}
              title={column.title}
              color={column.color}
              bgColor={column.bgColor}
              borderColor={column.borderColor}
              icon={column.icon}
            />
          ))}
        </div>
        
        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <Card className="shadow-2xl border-primary/50 w-[280px]">
              <CardContent className="p-3">
                <h3 className="font-medium text-sm">{activeTask.title}</h3>
                {activeTask.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeTask.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
