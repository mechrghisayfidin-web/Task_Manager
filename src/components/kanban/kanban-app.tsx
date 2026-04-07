'use client';

import { useEffect } from 'react';
import { useKanbanStore } from '@/stores/kanban-store';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { KanbanBoard } from './kanban-board';
import { TaskModal } from './task-modal';
import { DeleteTaskModal } from './delete-modal';

export function KanbanApp() {
  const { darkMode, currentProject } = useKanbanStore();
  
  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <Topbar />
        
        {/* Kanban Board */}
        <KanbanBoard />
        
        {/* Footer */}
        <footer className="h-10 border-t border-border/50 flex items-center justify-center text-xs text-muted-foreground">
          <span>Kanban Pro © {new Date().getFullYear()} - نظام إدارة المشاريع</span>
        </footer>
      </div>
      
      {/* Modals */}
      <TaskModal />
      <DeleteTaskModal />
    </div>
  );
}
