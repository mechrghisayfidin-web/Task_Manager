// ==================== KANBAN TYPES ====================

export type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_COMMENT' | 'PROJECT_INVITE' | 'MENTION';

// ==================== USER ====================
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ==================== PROJECT ====================
export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: ProjectMember[];
  tasks?: Task[];
}

// ==================== PROJECT MEMBER ====================
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: User;
}

// ==================== TASK ====================
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  projectId: string;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  project?: Project;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string;
  type: NotificationType;
  content: string;
  recipientId: string;
  read: boolean;
  taskId: string | null;
  createdAt: string;
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== COLUMN ====================
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

// ==================== SOCKET EVENTS ====================
export interface SocketEvents {
  // Client to Server
  'task:create': (task: Partial<Task>) => void;
  'task:update': (taskId: string, updates: Partial<Task>) => void;
  'task:delete': (taskId: string) => void;
  'task:move': (taskId: string, status: TaskStatus, order: number) => void;
  
  // Server to Client
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (taskId: string) => void;
  'task:moved': (task: Task) => void;
  'notification:new': (notification: Notification) => void;
}

// ==================== DRAG AND DROP ====================
export interface DragItem {
  id: string;
  type: 'task';
  task: Task;
}

export interface DropResult {
  taskId: string;
  newStatus: TaskStatus;
  newOrder: number;
  oldStatus: TaskStatus;
  oldOrder: number;
}
