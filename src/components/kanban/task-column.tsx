'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useKanbanStore } from '@/stores/kanban-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from './task-card';
import { Plus } from 'lucide-react';
import type { TaskStatus, Task } from '@/types/kanban';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

export function TaskColumn({ 
  status, 
  title, 
  color, 
  bgColor, 
  borderColor,
  icon 
}: TaskColumnProps) {
  const { getTasksByStatus, setTaskModalOpen, setSelectedTask } = useKanbanStore();
  
  const tasks = getTasksByStatus(status);
  
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });
  
  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };
  
  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-xl transition-all duration-200 min-w-[280px] max-w-[320px]
        ${isOver 
          ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' 
          : ''
        }
      `}
      style={{
        background: `linear-gradient(180deg, ${bgColor}10 0%, transparent 100%)`,
      }}
    >
      {/* Column Header */}
      <div className={`p-3 border-b-2 ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`${color}`}>{icon}</span>
            <h2 className="font-semibold text-sm">{title}</h2>
          </div>
          <Badge
            variant="secondary"
            className={`text-xs ${bgColor} bg-opacity-20`}
          >
            {tasks.length}
          </Badge>
        </div>
      </div>
      
      {/* Tasks List */}
      <ScrollArea className="flex-1 p-2 h-[calc(100vh-280px)]">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[100px]">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <div className={`w-12 h-12 rounded-full ${bgColor} bg-opacity-20 flex items-center justify-center mb-2`}>
                  {icon}
                </div>
                <p className="text-xs">لا توجد مهام</p>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
      
      {/* Add Task Button */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleAddTask}
        >
          <Plus className="w-4 h-4" />
          إضافة مهمة
        </Button>
      </div>
    </div>
  );
}
