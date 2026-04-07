import { create } from 'zustand';
import type { Task, Project, User, Notification, TaskStatus, TaskPriority } from '@/types/kanban';

// ==================== KANBAN STORE ====================
interface KanbanState {
  // Current User (Demo)
  currentUser: User | null;
  
  // Projects
  projects: Project[];
  currentProject: Project | null;
  
  // Tasks
  tasks: Task[];
  
  // UI State
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isProjectModalOpen: boolean;
  sidebarOpen: boolean;
  darkMode: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Filters
  filterPriority: TaskPriority | null;
  filterAssignee: string | null;
  searchQuery: string;
  
  // Loading States
  isLoading: boolean;
  isRealtimeConnected: boolean;
  
  // Actions - User
  setCurrentUser: (user: User | null) => void;
  
  // Actions - Projects
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Actions - Tasks
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  reorderTasks: (status: TaskStatus, tasks: Task[]) => void;
  
  // Actions - UI
  setSelectedTask: (task: Task | null) => void;
  setTaskModalOpen: (open: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;
  setProjectModalOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  
  // Actions - Notifications
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  
  // Actions - Filters
  setFilterPriority: (priority: TaskPriority | null) => void;
  setFilterAssignee: (assigneeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Actions - Loading
  setIsLoading: (loading: boolean) => void;
  setIsRealtimeConnected: (connected: boolean) => void;
  
  // Computed - Get filtered tasks
  getFilteredTasks: () => Task[];
  
  // Computed - Get tasks by status
  getTasksByStatus: (status: TaskStatus) => Task[];
}

// Demo user for testing
const demoUser: User = {
  id: 'demo-user-1',
  email: 'demo@kanban.app',
  name: 'Demo User',
  avatarUrl: null,
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo project for testing
const demoProject: Project = {
  id: 'demo-project-1',
  name: 'مشروع تجريبي',
  description: 'هذا مشروع تجريبي لعرض لوحة Kanban',
  ownerId: 'demo-user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo tasks
const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'تصميم واجهة المستخدم',
    description: 'تصميم واجهة المستخدم للتطبيق',
    status: 'DONE',
    priority: 'HIGH',
    order: 0,
    projectId: 'demo-project-1',
    assignedTo: 'demo-user-1',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'تطوير API الخلفية',
    description: 'إنشاء نقاط النهاية API للتطبيق',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    order: 0,
    projectId: 'demo-project-1',
    assignedTo: 'demo-user-1',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'اختبار الوحدة',
    description: 'كتابة اختبارات الوحدة للمكونات',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    order: 1,
    projectId: 'demo-project-1',
    assignedTo: null,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'توثيق API',
    description: 'كتابة توثيق شامل لـ API',
    status: 'PENDING',
    priority: 'LOW',
    order: 0,
    projectId: 'demo-project-1',
    assignedTo: null,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'مراجعة الكود',
    description: 'مراجعة كود الفريق',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    order: 0,
    projectId: 'demo-project-1',
    assignedTo: 'demo-user-1',
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'تحسين الأداء',
    description: 'تحسين أداء التطبيق وتقليل وقت التحميل',
    status: 'PENDING',
    priority: 'URGENT',
    order: 1,
    projectId: 'demo-project-1',
    assignedTo: 'demo-user-1',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useKanbanStore = create<KanbanState>((set, get) => ({
  // Initial State
  currentUser: demoUser,
  projects: [demoProject],
  currentProject: demoProject,
  tasks: demoTasks,
  selectedTask: null,
  isTaskModalOpen: false,
  isDeleteModalOpen: false,
  isProjectModalOpen: false,
  sidebarOpen: true,
  darkMode: false,
  notifications: [],
  unreadCount: 0,
  filterPriority: null,
  filterAssignee: null,
  searchQuery: '',
  isLoading: false,
  isRealtimeConnected: false,
  
  // User Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Project Actions
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === id ? { ...p, ...updates } : p
    ),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...updates } 
      : state.currentProject,
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject,
  })),
  
  // Task Actions
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => 
      t.id === id ? { ...t, ...updates } : t
    ),
    selectedTask: state.selectedTask?.id === id 
      ? { ...state.selectedTask, ...updates } 
      : state.selectedTask,
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
  })),
  moveTask: (taskId, newStatus, newOrder) => set((state) => {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return state;
    
    const updatedTasks = [...state.tasks];
    const task = updatedTasks[taskIndex];
    const oldStatus = task.status;
    
    // Update the moved task
    updatedTasks[taskIndex] = {
      ...task,
      status: newStatus,
      order: newOrder,
    };
    
    // Reorder tasks in the old column (if status changed)
    if (oldStatus !== newStatus) {
      updatedTasks
        .filter(t => t.status === oldStatus && t.id !== taskId)
        .sort((a, b) => a.order - b.order)
        .forEach((t, idx) => {
          const idx2 = updatedTasks.findIndex(ut => ut.id === t.id);
          updatedTasks[idx2] = { ...t, order: idx };
        });
    }
    
    // Reorder tasks in the new column
    updatedTasks
      .filter(t => t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.order - b.order)
      .forEach((t, idx) => {
        const idx2 = updatedTasks.findIndex(ut => ut.id === t.id);
        if (idx >= newOrder) {
          updatedTasks[idx2] = { ...t, order: idx + 1 };
        }
      });
    
    return { tasks: updatedTasks };
  }),
  reorderTasks: (status, reorderedTasks) => set((state) => ({
    tasks: state.tasks.map((t) => {
      if (t.status !== status) return t;
      const reordered = reorderedTasks.find(rt => rt.id === t.id);
      return reordered || t;
    }),
  })),
  
  // UI Actions
  setSelectedTask: (task) => set({ selectedTask: task }),
  setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),
  setDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
  setProjectModalOpen: (open) => set({ isProjectModalOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  // Notification Actions
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
  }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + (notification.read ? 0 : 1),
  })),
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n.id === notificationId ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  // Filter Actions
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterAssignee: (assigneeId) => set({ filterAssignee: assigneeId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () => set({ 
    filterPriority: null, 
    filterAssignee: null, 
    searchQuery: '' 
  }),
  
  // Loading Actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
  
  // Computed - Get filtered tasks
  getFilteredTasks: () => {
    const { tasks, filterPriority, filterAssignee, searchQuery } = get();
    
    return tasks.filter((task) => {
      // Priority filter
      if (filterPriority && task.priority !== filterPriority) {
        return false;
      }
      
      // Assignee filter
      if (filterAssignee && task.assignedTo !== filterAssignee) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description?.toLowerCase().includes(query) ?? false)
        );
      }
      
      return true;
    });
  },
  
  // Computed - Get tasks by status
  getTasksByStatus: (status) => {
    return get()
      .getFilteredTasks()
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  },
}));
