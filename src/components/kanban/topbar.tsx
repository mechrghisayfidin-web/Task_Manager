'use client';

import { useKanbanStore } from '@/stores/kanban-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  Moon,
  Sun,
  Bell,
  User,
  LogOut,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react';

export function Topbar() {
  const {
    currentProject,
    currentUser,
    darkMode,
    toggleDarkMode,
    setTaskModalOpen,
    unreadCount,
    isRealtimeConnected,
  } = useKanbanStore();
  
  return (
    <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      {/* Left Section - Project Info */}
      <div className="flex items-center gap-4">
        {currentProject && (
          <>
            <div>
              <h1 className="font-bold text-lg">{currentProject.name}</h1>
              {currentProject.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {currentProject.description}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <Badge
          variant="secondary"
          className={`
            hidden sm:flex items-center gap-1 text-xs
            ${isRealtimeConnected 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/20 text-rose-400'
            }
          `}
        >
          {isRealtimeConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              متصل
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              غير متصل
            </>
          )}
        </Badge>
        
        {/* Add Task Button */}
        <Button
          onClick={() => setTaskModalOpen(true)}
          className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مهمة</span>
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
        
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 p-1">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="w-4 h-4" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-rose-400">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
