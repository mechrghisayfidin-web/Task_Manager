'use client';

import { useKanbanStore } from '@/stores/kanban-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

export function DeleteTaskModal() {
  const {
    isDeleteModalOpen,
    setDeleteModalOpen,
    selectedTask,
    deleteTask,
  } = useKanbanStore();
  
  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setDeleteModalOpen(false);
    }
  };
  
  return (
    <AlertDialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <AlertDialogContent className="bg-background/95 backdrop-blur-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <AlertDialogTitle>حذف المهمة</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-right">
            هل أنت متأكد من حذف المهمة{' '}
            <span className="font-semibold text-foreground">
              "{selectedTask?.title}"
            </span>
            ؟
            <br />
            <span className="text-rose-400 text-sm">
              هذا الإجراء لا يمكن التراجع عنه.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            حذف المهمة
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
