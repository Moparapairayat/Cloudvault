import { useState } from 'react';
import { useTrashFiles, FileItem } from '@/hooks/useFiles';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Trash2, 
  RotateCcw, 
  Folder,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  File,
  X,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(file: FileItem) {
  if (file.is_folder) return Folder;
  
  const mimeType = file.mime_type || '';
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.startsWith('text/') || mimeType.includes('document')) return FileText;
  
  return File;
}

function getIconColor(file: FileItem) {
  if (file.is_folder) return 'text-amber-500';
  
  const mimeType = file.mime_type || '';
  if (mimeType.startsWith('image/')) return 'text-pink-500';
  if (mimeType.startsWith('video/')) return 'text-purple-500';
  if (mimeType.startsWith('audio/')) return 'text-green-500';
  if (mimeType.startsWith('text/')) return 'text-blue-500';
  
  return 'text-muted-foreground';
}

export function TrashView() {
  const { 
    files, 
    isLoading, 
    restoreFile, 
    isRestoring,
    permanentDelete,
    isPermanentDeleting,
    emptyTrash,
    isEmptyingTrash
  } = useTrashFiles();
  
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const hasSelection = selectedFiles.size > 0;
  const allSelected = files.length > 0 && selectedFiles.size === files.length;

  const handleSelectFile = (fileId: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(fileId);
      } else {
        next.delete(fileId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedFiles(new Set(files.map(f => f.id)));
  };

  const handleClearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleRestoreSelected = () => {
    selectedFiles.forEach(fileId => {
      restoreFile(fileId);
    });
    setSelectedFiles(new Set());
  };

  const handleDeleteSelected = () => {
    selectedFiles.forEach(fileId => {
      permanentDelete(fileId);
    });
    setSelectedFiles(new Set());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-fade-in">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 shadow-soft">
          <Trash2 className="w-16 h-16 opacity-50" />
        </div>
        <p className="text-xl font-semibold text-foreground mb-2">Trash is empty</p>
        <p className="text-sm">Files you delete will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trash2 className="w-4 h-4" />
          <span>{files.length} items in trash</span>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={files.length === 0 || isEmptyingTrash}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Empty Trash
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Empty Trash?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all {files.length} items in your trash. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => emptyTrash()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Selection toolbar */}
      {hasSelection && (
        <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={allSelected} 
              onCheckedChange={() => allSelected ? handleClearSelection() : handleSelectAll()}
            />
            <span className="text-sm font-medium">
              {selectedFiles.size} selected
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRestoreSelected} disabled={isRestoring}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Forever
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedFiles.size} items. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteSelected}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* File list */}
      <div className="space-y-2 animate-fade-in">
        {files.map((file) => {
          const Icon = getFileIcon(file);
          const iconColor = getIconColor(file);
          const isSelected = selectedFiles.has(file.id);
          
          return (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-4 p-4 border rounded-lg transition-all hover:bg-muted/50",
                isSelected && "bg-primary/5 border-primary/30"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
              />
              
              <div className={cn("p-2 rounded-lg bg-muted/50", iconColor)}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {!file.is_folder && formatBytes(file.size)} • 
                  Deleted {file.deleted_at && formatDistanceToNow(new Date(file.deleted_at), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restoreFile(file.id)}
                  disabled={isRestoring}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isPermanentDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{file.name}" will be deleted forever. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => permanentDelete(file.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}