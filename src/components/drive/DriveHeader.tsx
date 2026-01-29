import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Cloud, Plus, Upload, FolderPlus, Grid, List, Search, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface DriveHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onUpload: (file: File) => void;
  onCreateFolder: (name: string) => void;
  isUploading: boolean;
  isCreatingFolder: boolean;
  currentFolderId: string | null;
}

export function DriveHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onUpload,
  onCreateFolder,
  isUploading,
  isCreatingFolder,
  currentFolderId,
}: DriveHeaderProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signOut, user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    e.target.value = '';
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      setFolderDialogOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl gradient-primary-vibrant flex items-center justify-center shadow-glow animate-pulse-glow">
                <Cloud className="w-6 h-6 text-primary-foreground drop-shadow-lg" />
              </div>
              <span className="text-xl font-bold hidden sm:inline text-gradient-vibrant">CloudVault</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 h-11 glass border-transparent rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gradient-primary-vibrant shadow-glow hover-lift rounded-xl animate-shimmer" disabled={isUploading || isCreatingFolder}>
                    {isUploading || isCreatingFolder ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-5 h-5 mr-2 drop-shadow-md" />
                    )}
                    <span className="hidden sm:inline font-semibold">New</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card rounded-xl border-0 p-1">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="rounded-lg hover:bg-primary/10 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFolderDialogOpen(true)} className="rounded-lg hover:bg-primary/10 cursor-pointer">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden sm:flex items-center glass rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("h-9 w-9 rounded-lg transition-all", viewMode === 'grid' && "shadow-soft")}
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("h-9 w-9 rounded-lg transition-all", viewMode === 'list' && "shadow-soft")}
                  onClick={() => onViewModeChange('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover-scale">
                    <div className="w-10 h-10 rounded-full gradient-primary-vibrant flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-glow">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card rounded-xl border-0 p-1">
                  <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border/50 mb-1">
                    {user?.email}
                  </div>
                  <DropdownMenuItem onClick={signOut} className="text-destructive rounded-lg cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
