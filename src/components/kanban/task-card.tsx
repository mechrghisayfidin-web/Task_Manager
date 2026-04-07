'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '@/stores/kanban-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  GripVertical,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import type { Task, TaskPriority } from '@/types/kanban';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
}

const priorityConfig: Record<TaskPriority, { color: string; label: string; icon: React.ReactNode }> = {
  LOW: {
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    label: 'منخفض',
    icon: null,
  },
  MEDIUM: {
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'متوسط',
    icon: null,
  },
  HIGH: {
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    label: 'عالي',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  URGENT: {
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    label: 'عاجل',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

export function TaskCard({ task }: TaskCardProps) {
  const { setSelectedTask, setTaskModalOpen, setDeleteModalOpen } = useKanbanStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate));
  
  const handleEdit = () => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };
  
  const handleDelete = () => {
    setSelectedTask(task);
    setDeleteModalOpen(true);
  };
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        group cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging 
          ? 'opacity-50 shadow-2xl scale-105 rotate-2 z-50 border-primary/50' 
          : 'hover:shadow-lg hover:border-primary/30'
        }
        bg-card/50 backdrop-blur-sm border-border/50
      `}
    >
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-sm leading-snug">{task.title}</h3>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={handleEdit} className="gap-2">
                  <Edit className="w-4 h-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="gap-2 text-rose-400 focus:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-grab p-1"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={`text-xs ${priority.color} gap-1`}
          >
            {priority.icon}
            {priority.label}
          </Badge>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          {task.assignedTo ? (
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignee?.avatarUrl || undefined} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                {task.assignee?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          
          {/* Due Date */}
          {task.dueDate && (
            <div
              className={`
                flex items-center gap-1 text-xs
                ${isOverdue ? 'text-rose-400' : 'text-muted-foreground'}
              `}
            >
              {isOverdue ? (
                <Clock className="w-3 h-3" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              <span>
                {formatDistanceToNow(new Date(task.dueDate), {
                  addSuffix: true,
                  locale: ar,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
