import { FileItem } from '@/hooks/useFiles';
import { FileCard } from './FileCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderPlus, Upload, Trash2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileGridProps {
  files: FileItem[];
  onFolderClick: (folderId: string) => void;
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onPreview?: (file: FileItem) => void;
  viewMode: 'grid' | 'list';
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export function FileGrid({ 
  files, 
  onFolderClick, 
  onDownload, 
  onDelete, 
  onRename, 
  onPreview,
  viewMode,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onClearSelection,
  onDeleteSelected
}: FileGridProps) {
  const hasSelection = selectedFiles.size > 0;
  const allSelected = files.length > 0 && selectedFiles.size === files.length;

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-fade-in">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6 shadow-soft">
          <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-foreground mb-2">No files yet</p>
        <p className="text-sm mb-6">Drag and drop files or use the New button to get started</p>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload file
          </Button>
          <Button variant="outline" className="gap-2">
            <FolderPlus className="w-4 h-4" />
            New folder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection toolbar */}
      {hasSelection && (
        <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={allSelected} 
              onCheckedChange={() => allSelected ? onClearSelection() : onSelectAll()}
            />
            <span className="text-sm font-medium">
              {selectedFiles.size} selected
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onDeleteSelected} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="space-y-1 animate-fade-in">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onFolderClick={onFolderClick}
              onDownload={onDownload}
              onDelete={onDelete}
              onRename={onRename}
              onPreview={onPreview}
              viewMode={viewMode}
              isSelected={selectedFiles.has(file.id)}
              onSelect={onSelectFile}
              showCheckbox={hasSelection}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onFolderClick={onFolderClick}
              onDownload={onDownload}
              onDelete={onDelete}
              onRename={onRename}
              onPreview={onPreview}
              viewMode={viewMode}
              isSelected={selectedFiles.has(file.id)}
              onSelect={onSelectFile}
              showCheckbox={hasSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
