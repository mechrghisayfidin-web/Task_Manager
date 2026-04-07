'use client';

import { useState } from 'react';
import { useKanbanStore } from '@/stores/kanban-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Search, 
  Plus, 
  Folder, 
  Filter, 
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import type { TaskPriority, Project } from '@/types/kanban';

interface SidebarContentProps {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  filterPriority: TaskPriority | null;
  filterAssignee: string | null;
  searchQuery: string;
  setFilterPriority: (priority: TaskPriority | null) => void;
  setFilterAssignee: (assigneeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  setProjectModalOpen: (open: boolean) => void;
  tasks: { projectId: string }[];
  hasActiveFilters: boolean;
  assignees: (string | null)[];
}

function SidebarContent({
  projects,
  currentProject,
  setCurrentProject,
  filterPriority,
  filterAssignee,
  searchQuery,
  setFilterPriority,
  setFilterAssignee,
  setSearchQuery,
  clearFilters,
  setProjectModalOpen,
  tasks,
  hasActiveFilters,
  assignees,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Kanban Pro</h1>
            <p className="text-xs text-muted-foreground">إدارة المشاريع</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث في المهام..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 bg-background/50"
          />
        </div>
      </div>
      
      {/* Projects Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">المشاريع</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setProjectModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[180px]">
          <div className="space-y-1">
            {projects.map((project) => {
              const taskCount = tasks.filter(t => t.projectId === project.id).length;
              const isActive = currentProject?.id === project.id;
              
              return (
                <button
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                >
                  <Folder className="w-4 h-4" />
                  <span className="flex-1 text-right truncate">{project.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {taskCount}
                  </Badge>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      
      <Separator />
      
      {/* Filters Section */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" />
            الفلاتر
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-rose-400 hover:text-rose-300"
              onClick={clearFilters}
            >
              <X className="w-3 h-3 ml-1" />
              مسح
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {/* Priority Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">الأولوية</label>
            <Select
              value={filterPriority || 'all'}
              onValueChange={(v) => setFilterPriority(v === 'all' ? null : v as TaskPriority)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="جميع الأولويات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="URGENT">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    عاجل
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    عالي
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    متوسط
                  </div>
                </SelectItem>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    منخفض
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Assignee Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">المسؤول</label>
            <Select
              value={filterAssignee || 'all'}
              onValueChange={(v) => setFilterAssignee(v === 'all' ? null : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="جميع المسؤولين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المسؤولين</SelectItem>
                <SelectItem value="unassigned">غير مخصص</SelectItem>
                {assignees.map((id) => (
                  id && <SelectItem key={id} value={id}>
                    {id === 'demo-user-1' ? 'Demo User' : id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <Users className="w-4 h-4 ml-2" />
            الفريق
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    sidebarOpen,
    setSidebarOpen,
    filterPriority,
    filterAssignee,
    searchQuery,
    setFilterPriority,
    setFilterAssignee,
    setSearchQuery,
    clearFilters,
    setProjectModalOpen,
    tasks,
  } = useKanbanStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const hasActiveFilters = filterPriority || filterAssignee || searchQuery;
  
  // Get unique assignees from tasks
  const assignees = Array.from(
    new Set(tasks.map(t => t.assignedTo).filter(Boolean))
  );
  
  const sidebarContentProps = {
    projects,
    currentProject,
    setCurrentProject,
    filterPriority,
    filterAssignee,
    searchQuery,
    setFilterPriority,
    setFilterAssignee,
    setSearchQuery,
    clearFilters,
    setProjectModalOpen,
    tasks,
    hasActiveFilters: !!hasActiveFilters,
    assignees,
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col border-l border-border/50 bg-background/95 backdrop-blur-sm
          transition-all duration-300 h-full relative
          ${sidebarOpen ? 'w-72' : 'w-0'}
        `}
      >
        {sidebarOpen && <SidebarContent {...sidebarContentProps} />}
        
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-10 p-0 rounded-l-md border border-border/50 bg-background shadow-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 right-4 z-50"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SidebarContent {...sidebarContentProps} />
        </SheetContent>
      </Sheet>
    </>
  );
}
