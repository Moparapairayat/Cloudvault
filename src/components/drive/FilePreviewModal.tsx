import { useState, useEffect } from 'react';
import { FileItem } from '@/hooks/useFiles';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileAudio,
  FileVideo,
  File,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface FilePreviewModalProps {
  file: FileItem | null;
  files: FileItem[];
  onClose: () => void;
  onDownload: (fileId: string) => void;
  onNavigate: (file: FileItem) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileTypeIcon(mimeType: string | null) {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return null;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) return FileCode;
  if (mimeType.includes('text')) return FileText;
  return File;
}

export function FilePreviewModal({ file, files, onClose, onDownload, onNavigate }: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const nonFolderFiles = files.filter(f => !f.is_folder);
  const currentIndex = file ? nonFolderFiles.findIndex(f => f.id === file.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < nonFolderFiles.length - 1;

  useEffect(() => {
    if (!file || file.is_folder) {
      setPreviewUrl(null);
      return;
    }

    const fetchPreview = async () => {
      setIsLoading(true);
      setZoom(1);
      setRotation(0);
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
          setPreviewUrl(result.url);
        }
      } catch (error) {
        console.error('Failed to load preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [file?.id]);

  const handlePrev = () => {
    if (hasPrev) {
      onNavigate(nonFolderFiles[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(nonFolderFiles[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!file) return null;

  const isImage = file.mime_type?.startsWith('image/');
  const isVideo = file.mime_type?.startsWith('video/');
  const isAudio = file.mime_type?.startsWith('audio/');
  const isPdf = file.mime_type === 'application/pdf';
  const FileIcon = getFileTypeIcon(file.mime_type);

  return (
    <Dialog open={!!file} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-xl">
        <DialogTitle className="sr-only">Preview: {file.name}</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{file.name}</h2>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setRotation(r => r + 90)}>
                  <RotateCw className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => onDownload(file.id)}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-muted/30">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading preview...</span>
            </div>
          ) : isImage && previewUrl ? (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-w-none transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  maxHeight: zoom === 1 ? '100%' : 'none',
                  maxWidth: zoom === 1 ? '100%' : 'none',
                }}
              />
            </div>
          ) : isVideo && previewUrl ? (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full"
            />
          ) : isAudio && previewUrl ? (
            <div className="flex flex-col items-center gap-6 p-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                <FileAudio className="w-16 h-16 text-white" />
              </div>
              <audio src={previewUrl} controls className="w-80" />
            </div>
          ) : isPdf && previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title={file.name}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 p-8">
              {FileIcon && <FileIcon className="w-24 h-24 text-muted-foreground/50" />}
              <p className="text-muted-foreground">Preview not available for this file type</p>
              <Button onClick={() => onDownload(file.id)} className="gradient-primary">
                <Download className="w-4 h-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}

          {/* Navigation arrows */}
          {hasPrev && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg"
              onClick={handleNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Footer with file counter */}
        <div className="p-3 border-t bg-background/80 flex justify-center">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {nonFolderFiles.length} files
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
