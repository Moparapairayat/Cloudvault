import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  isUploading: boolean;
  children: React.ReactNode;
}

export function DropZone({ onFilesDropped, isUploading, children }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  return (
    <div
      className="relative min-h-full"
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {children}

      {/* Drop overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 pointer-events-none",
          isDragActive 
            ? "opacity-100" 
            : "opacity-0"
        )}
      >
        {/* Gradient background overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-primary/20 backdrop-blur-md transition-opacity duration-500",
          isDragActive ? "opacity-100" : "opacity-0"
        )} />
        
        <div
          className={cn(
            "relative flex flex-col items-center gap-6 p-16 rounded-3xl glass-card transition-all duration-500",
            isDragActive 
              ? "scale-100 shadow-elevated" 
              : "scale-90"
          )}
        >
          {isUploading ? (
            <>
              <div className="w-24 h-24 rounded-3xl gradient-primary-vibrant flex items-center justify-center animate-pulse shadow-glow">
                <Loader2 className="w-12 h-12 text-primary-foreground animate-spin drop-shadow-lg" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">Uploading...</p>
                <p className="text-muted-foreground mt-2">Please wait while your files are being uploaded</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-3xl gradient-primary-vibrant flex items-center justify-center shadow-glow animate-float">
                <Upload className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">Drop files here</p>
                <p className="text-muted-foreground mt-2">Release to upload your files</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
