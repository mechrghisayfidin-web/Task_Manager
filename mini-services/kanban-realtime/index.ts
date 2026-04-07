import { Server } from 'socket.io';

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

console.log(`🚀 Kanban Real-time Server running on port ${PORT}`);

// Store connected users and their rooms
const userRooms = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);
  
  // Join a project room
  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    
    if (!userRooms.has(socket.id)) {
      userRooms.set(socket.id, new Set());
    }
    userRooms.get(socket.id)!.add(`project:${projectId}`);
    
    console.log(`👤 Client ${socket.id} joined project: ${projectId}`);
    
    // Notify others in the room
    socket.to(`project:${projectId}`).emit('user-joined', {
      userId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Leave a project room
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    
    const rooms = userRooms.get(socket.id);
    if (rooms) {
      rooms.delete(`project:${projectId}`);
    }
    
    console.log(`👋 Client ${socket.id} left project: ${projectId}`);
  });
  
  // ==================== TASK EVENTS ====================
  
  // Task Created
  socket.on('task:created', (data: { task: any; projectId: string }) => {
    console.log(`✅ Task created: ${data.task.id}`);
    io.to(`project:${data.projectId}`).emit('task:created', data.task);
  });
  
  // Task Updated
  socket.on('task:updated', (data: { task: any; projectId: string }) => {
    console.log(`📝 Task updated: ${data.task.id}`);
    io.to(`project:${data.projectId}`).emit('task:updated', data.task);
  });
  
  // Task Deleted
  socket.on('task:deleted', (data: { taskId: string; projectId: string }) => {
    console.log(`🗑️ Task deleted: ${data.taskId}`);
    io.to(`project:${data.projectId}`).emit('task:deleted', { taskId: data.taskId });
  });
  
  // Task Moved (Drag & Drop)
  socket.on('task:moved', (data: { 
    taskId: string; 
    projectId: string;
    status: string;
    order: number;
  }) => {
    console.log(`🔄 Task moved: ${data.taskId} to ${data.status}`);
    socket.to(`project:${data.projectId}`).emit('task:moved', data);
  });
  
  // Tasks Reordered (Batch update)
  socket.on('tasks:reordered', (data: { 
    tasks: any[]; 
    projectId: string;
    status: string;
  }) => {
    console.log(`📊 Tasks reordered in ${data.status}: ${data.tasks.length} tasks`);
    io.to(`project:${data.projectId}`).emit('tasks:reordered', data);
  });
  
  // ==================== NOTIFICATION EVENTS ====================
  
  // New Notification
  socket.on('notification:new', (data: { notification: any; userId: string }) => {
    console.log(`🔔 New notification for user: ${data.userId}`);
    io.emit(`notification:${data.userId}`, data.notification);
  });
  
  // ==================== CURSOR TRACKING ====================
  
  // Track user cursor position for collaborative editing
  socket.on('cursor:move', (data: { 
    projectId: string;
    x: number;
    y: number;
    userName: string;
  }) => {
    socket.to(`project:${data.projectId}`).emit('cursor:update', {
      userId: socket.id,
      x: data.x,
      y: data.y,
      userName: data.userName,
    });
  });
  
  // ==================== PRESENCE ====================
  
  // User is typing
  socket.on('typing:start', (data: { projectId: string; taskId: string }) => {
    socket.to(`project:${data.projectId}`).emit('typing:start', {
      taskId: data.taskId,
      userId: socket.id,
    });
  });
  
  socket.on('typing:stop', (data: { projectId: string; taskId: string }) => {
    socket.to(`project:${data.projectId}`).emit('typing:stop', {
      taskId: data.taskId,
      userId: socket.id,
    });
  });
  
  // ==================== DISCONNECT ====================
  
  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
    
    // Clean up rooms
    const rooms = userRooms.get(socket.id);
    if (rooms) {
      rooms.forEach((room) => {
        socket.to(room).emit('user-left', {
          userId: socket.id,
          timestamp: new Date().toISOString(),
        });
      });
      userRooms.delete(socket.id);
    }
  });
});

// Health check endpoint
console.log(`✅ Server ready for connections`);
