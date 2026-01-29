import { useState } from 'react';
import { 
  Home, 
  Clock, 
  Star, 
  Trash2, 
  Settings, 
  ChevronLeft,
  Cloud,
  FolderPlus,
  Upload,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StorageUsage } from './StorageUsage';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  isUploading: boolean;
  isCreatingFolder: boolean;
}

const navItems = [
  { title: 'My Drive', icon: Home, value: 'drive' },
  { title: 'Recent', icon: Clock, value: 'recent' },
  { title: 'Starred', icon: Star, value: 'starred' },
  { title: 'Trash', icon: Trash2, value: 'trash' },
];

export function AppSidebar({ 
  currentView, 
  onViewChange, 
  onUploadClick, 
  onNewFolderClick,
  isUploading,
  isCreatingFolder
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar/80 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="w-11 h-11 rounded-2xl gradient-primary-vibrant flex items-center justify-center shadow-glow animate-pulse-glow shrink-0">
            <Cloud className="w-6 h-6 text-primary-foreground drop-shadow-lg" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-gradient-vibrant">
              CloudVault
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* New button */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className={cn(
                  "gradient-primary-vibrant shadow-glow hover-lift animate-shimmer transition-all duration-300",
                  isCollapsed ? "w-11 h-11 p-0 rounded-xl" : "w-full rounded-xl"
                )}
                disabled={isUploading || isCreatingFolder}
              >
                {isUploading || isCreatingFolder ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className={cn("w-5 h-5 drop-shadow-md", !isCollapsed && "mr-2")} />
                    {!isCollapsed && <span className="font-semibold">New</span>}
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48 glass-card rounded-xl border-0 p-1">
              <DropdownMenuItem onClick={onUploadClick} className="rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Upload file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNewFolderClick} className="rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                <FolderPlus className="w-4 h-4 mr-2" />
                New folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.value)}
                    isActive={currentView === item.value}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-300 rounded-xl",
                      currentView === item.value 
                        ? "bg-primary/15 text-primary font-semibold shadow-soft" 
                        : "hover:bg-muted/60"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      currentView === item.value && "scale-110"
                    )} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t">
        <StorageUsage collapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
