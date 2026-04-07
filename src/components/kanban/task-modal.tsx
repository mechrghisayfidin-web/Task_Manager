'use client';

import { useState, useMemo } from 'react';
import { useKanbanStore } from '@/stores/kanban-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskPriority, TaskStatus } from '@/types/kanban';

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'منخفض', color: 'bg-emerald-500' },
  { value: 'MEDIUM', label: 'متوسط', color: 'bg-amber-500' },
  { value: 'HIGH', label: 'عالي', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'عاجل', color: 'bg-rose-500' },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'IN_PROGRESS', label: 'قيد التنفيذ' },
  { value: 'IN_REVIEW', label: 'قيد المراجعة' },
  { value: 'DONE', label: 'مكتمل' },
];

export function TaskModal() {
  const {
    isTaskModalOpen,
    setTaskModalOpen,
    selectedTask,
    addTask,
    updateTask,
    currentProject,
    currentUser,
  } = useKanbanStore();
  
  // Use useMemo to derive initial form state
  const initialFormState = useMemo(() => ({
    title: selectedTask?.title || '',
    description: selectedTask?.description || '',
    status: selectedTask?.status || 'PENDING' as TaskStatus,
    priority: selectedTask?.priority || 'MEDIUM' as TaskPriority,
    dueDate: selectedTask?.dueDate ? new Date(selectedTask.dueDate) : undefined,
    assignedTo: selectedTask?.assignedTo || '',
  }), [selectedTask]);
  
  // Form state
  const [title, setTitle] = useState(initialFormState.title);
  const [description, setDescription] = useState(initialFormState.description);
  const [status, setStatus] = useState<TaskStatus>(initialFormState.status);
  const [priority, setPriority] = useState<TaskPriority>(initialFormState.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialFormState.dueDate);
  const [assignedTo, setAssignedTo] = useState<string>(initialFormState.assignedTo);
  
  // Update form state when selectedTask changes via key prop on Dialog
  // The Dialog component will be remounted when selectedTask changes
  
  const handleSubmit = () => {
    if (!title.trim() || !currentProject) return;
    
    if (selectedTask) {
      // Update existing task
      updateTask(selectedTask.id, {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate?.toISOString() || null,
        assignedTo: assignedTo || null,
      });
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        description: description || null,
        status,
        priority,
        order: 0,
        projectId: currentProject.id,
        assignedTo: assignedTo || null,
        dueDate: dueDate?.toISOString() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTask(newTask);
    }
    
    setTaskModalOpen(false);
  };
  
  const handleClose = () => {
    setTaskModalOpen(false);
  };
  
  return (
    <Dialog open={isTaskModalOpen} onOpenChange={handleClose}>
      <DialogContent 
        key={selectedTask?.id || 'new'}
        className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm"
      >
        <DialogHeader>
          <DialogTitle>
            {selectedTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">عنوان المهمة</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المهمة..."
              className="bg-background/50"
            />
          </div>
          
          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف المهمة..."
              rows={3}
              className="bg-background/50 resize-none"
            />
          </div>
          
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>الحالة</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>الأولوية</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Due Date & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>تاريخ الاستحقاق</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-right font-normal bg-background/50',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, 'PPP', { locale: ar })
                    ) : (
                      'اختر تاريخ'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>المسؤول</Label>
              <Select 
                value={assignedTo || 'none'} 
                onValueChange={(v) => setAssignedTo(v === 'none' ? '' : v)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="اختر المسؤول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">غير مخصص</SelectItem>
                  <SelectItem value={currentUser?.id || 'demo-user-1'}>
                    {currentUser?.name || 'Demo User'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
            disabled={!title.trim()}
          >
            {selectedTask ? 'حفظ التغييرات' : 'إضافة المهمة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
