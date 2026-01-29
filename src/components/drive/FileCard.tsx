import { useState, useEffect, forwardRef } from 'react';
import { FileItem } from '@/hooks/useFiles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Folder,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Presentation,
  MoreVertical,
  Download,
  Trash2,
  Pencil,
  X,
  Check,
  Star,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FileCardProps {
  file: FileItem;
  onFolderClick: (folderId: string) => void;
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onPreview?: (file: FileItem) => void;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: (fileId: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

function getFileIcon(file: FileItem) {
  if (file.is_folder) return Folder;
  
  const mimeType = file.mime_type || '';
  const name = file.name.toLowerCase();
  
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('document') || mimeType.includes('msword') || mimeType.includes('wordprocessing')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')) return FileSpreadsheet;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || name.endsWith('.pptx') || name.endsWith('.ppt')) return Presentation;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('gzip') || name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return FileArchive;
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('xml') ||
      name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx') || name.endsWith('.py') || name.endsWith('.java') || name.endsWith('.cpp') || name.endsWith('.c') || name.endsWith('.go') || name.endsWith('.rs')) return FileCode;
  if (mimeType.includes('text') || name.endsWith('.txt') || name.endsWith('.md')) return FileText;
  
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getIconColor(file: FileItem): string {
  if (file.is_folder) return 'text-primary';
  
  const mimeType = file.mime_type || '';
  const name = file.name.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'text-pink-500';
  if (mimeType.startsWith('video/')) return 'text-purple-500';
  if (mimeType.startsWith('audio/')) return 'text-orange-500';
  if (mimeType === 'application/pdf') return 'text-red-500';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || name.endsWith('.csv') || name.endsWith('.xlsx')) return 'text-green-500';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || name.endsWith('.pptx')) return 'text-amber-500';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'text-yellow-600';
  if (mimeType.includes('javascript') || mimeType.includes('json') || name.endsWith('.ts') || name.endsWith('.js')) return 'text-blue-500';
  
  return 'text-muted-foreground';
}

function isImageFile(file: FileItem): boolean {
  const mimeType = file.mime_type || '';
  return mimeType.startsWith('image/');
}

function useThumbnailUrl(file: FileItem) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isImageFile(file)) return;

    const fetchThumbnail = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-download`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId: file.id }),
        });

        const result = await response.json();
        if (response.ok && result.url) {
          setThumbnailUrl(result.url);
        }
      } catch (error) {
        console.error('Failed to load thumbnail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnail();
  }, [file.id, file.mime_type]);

  return { thumbnailUrl, isLoading };
}

export const FileCard = forwardRef<HTMLDivElement, FileCardProps>(({ 
  file, 
  onFolderClick, 
  onDownload, 
  onDelete, 
  onRename, 
  onPreview,
  viewMode,
  isSelected = false,
  onSelect,
  showCheckbox = false
}, ref) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const Icon = getFileIcon(file);
  const iconColor = getIconColor(file);
  const { thumbnailUrl, isLoading: isThumbnailLoading } = useThumbnailUrl(file);
  const showThumbnail = isImageFile(file) && thumbnailUrl;

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect?.(file.id, !isSelected);
      return;
    }
    
    if (file.is_folder) {
      onFolderClick(file.id);
    } else if (onPreview) {
      onPreview(file);
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(file.name);
      setIsRenaming(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 p-3 rounded-xl glass transition-all duration-300 group cursor-pointer hover:shadow-card",
          isSelected && "bg-primary/10 ring-2 ring-primary shadow-glow"
        )}
        onClick={handleClick}
      >
        {showCheckbox && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={(checked) => onSelect?.(file.id, !!checked)}
              className="transition-all duration-200"
            />
          </div>
        )}
        <div className={cn(
          "w-11 h-11 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center overflow-hidden shrink-0 shadow-soft transition-transform duration-300 group-hover:scale-105",
          !showThumbnail && iconColor
        )}>
          {showThumbnail ? (
            <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <Icon className="w-5 h-5 drop-shadow-md" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleRename}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setNewName(file.name); setIsRenaming(false); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="font-medium truncate">{file.name}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="text-sm text-muted-foreground w-24 text-right hidden sm:block">
          {formatFileSize(file.size)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!file.is_folder && onPreview && (
              <DropdownMenuItem onClick={() => onPreview(file)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            {!file.is_folder && (
              <DropdownMenuItem onClick={() => onDownload(file.id)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "glass-card rounded-2xl p-4 cursor-pointer group animate-scale-in hover-lift",
        isSelected && "ring-2 ring-primary shadow-glow"
      )}
      onClick={handleClick}
    >
      <div className="relative">
        {showCheckbox && (
          <div 
            className={cn(
              "absolute top-1 left-1 z-10 transition-all duration-300",
              isSelected || showCheckbox ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={(checked) => onSelect?.(file.id, !!checked)}
              className="bg-background/90 border-primary/30"
            />
          </div>
        )}
        <div className={cn(
          "w-full aspect-square rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center mb-3 overflow-hidden transition-all duration-300 group-hover:scale-[1.03] shadow-soft",
          !showThumbnail && iconColor
        )}>
          {isThumbnailLoading ? (
            <div className="w-12 h-12 rounded-xl bg-muted/60 animate-pulse" />
          ) : showThumbnail ? (
            <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <Icon className="w-12 h-12 drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!file.is_folder && onPreview && (
              <DropdownMenuItem onClick={() => onPreview(file)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            {!file.is_folder && (
              <DropdownMenuItem onClick={() => onDownload(file.id)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isRenaming ? (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-xs glass"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleRename}>
            <Check className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <>
          <p className="font-semibold text-sm truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {file.is_folder ? 'Folder' : formatFileSize(file.size)}
          </p>
        </>
      )}
    </div>
  );
});

FileCard.displayName = 'FileCard';
