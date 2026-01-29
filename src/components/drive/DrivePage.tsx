import { useState, useRef, useMemo } from 'react';
import { useFiles, useSearchFiles, FileItem } from '@/hooks/useFiles';
import { Breadcrumbs } from './Breadcrumbs';
import { FileGrid } from './FileGrid';
import { FilePreviewModal } from './FilePreviewModal';
import { DropZone } from './DropZone';
import { AppSidebar } from './AppSidebar';
import { TrashView } from './TrashView';
import { SortControls, SortField, SortOrder } from './SortControls';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
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
import { Grid, List, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DrivePage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState('drive');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isLoading,
    uploadFile,
    isUploading,
    createFolder,
    isCreatingFolder,
    deleteFile,
    downloadFile,
    renameFile,
  } = useFiles(currentFolderId);

  const { data: searchResults = [], isLoading: isSearching } = useSearchFiles(searchQuery);

  // Sort files
  const sortedFiles = useMemo(() => {
    const filesToSort = searchQuery ? searchResults : files;
    
    return [...filesToSort].sort((a, b) => {
      // Always show folders first
      if (a.is_folder && !b.is_folder) return -1;
      if (!a.is_folder && b.is_folder) return 1;

      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'mime_type':
          comparison = (a.mime_type || '').localeCompare(b.mime_type || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [files, searchResults, searchQuery, sortField, sortOrder]);

  const loading = searchQuery ? isSearching : isLoading;

  const handleUpload = (file: File) => {
    uploadFile({ file, parentFolderId: currentFolderId });
  };

  const handleFilesDropped = (droppedFiles: File[]) => {
    droppedFiles.forEach(file => {
      uploadFile({ file, parentFolderId: currentFolderId });
    });
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolder({ name: folderName.trim(), parentFolderId: currentFolderId });
      setFolderName('');
      setFolderDialogOpen(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setSearchQuery('');
    setCurrentFolderId(folderId);
    setSelectedFiles(new Set());
    setCurrentView('drive');
  };

  const handleNavigate = (folderId: string | null) => {
    setSearchQuery('');
    setCurrentFolderId(folderId);
    setSelectedFiles(new Set());
    setCurrentView('drive');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSearchQuery('');
    setSelectedFiles(new Set());
    if (view === 'drive') {
      setCurrentFolderId(null);
    }
  };

  const handleRename = (fileId: string, newName: string) => {
    renameFile({ fileId, newName });
  };

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
    setSelectedFiles(new Set(sortedFiles.map(f => f.id)));
  };

  const handleClearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleDeleteSelected = () => {
    selectedFiles.forEach(fileId => {
      deleteFile(fileId);
    });
    setSelectedFiles(new Set());
  };

  const handlePreviewNavigate = (file: FileItem) => {
    setPreviewFile(file);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          currentView={currentView}
          onViewChange={handleViewChange}
          onUploadClick={() => fileInputRef.current?.click()}
          onNewFolderClick={() => setFolderDialogOpen(true)}
          isUploading={isUploading}
          isCreatingFolder={isCreatingFolder}
        />

        <SidebarInset className="flex-1">
          <DropZone onFilesDropped={handleFilesDropped} isUploading={isUploading}>
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
              <div className="flex items-center gap-4 p-4">
                <SidebarTrigger className="shrink-0" />
                
                {/* Search */}
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background"
                    />
                  </div>
                </div>

                {/* View controls */}
                <div className="flex items-center gap-2">
                  <SortControls 
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                  />
                  
                  <div className="hidden sm:flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="p-6">
              {currentView === 'trash' ? (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">Trash</h1>
                  </div>
                  <TrashView />
                </>
              ) : (
                <>
                  {!searchQuery && (
                    <Breadcrumbs currentFolderId={currentFolderId} onNavigate={handleNavigate} />
                  )}

                  {searchQuery && (
                    <div className="mb-4 text-sm text-muted-foreground">
                      Search results for "{searchQuery}"
                    </div>
                  )}

                  {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="aspect-square rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FileGrid
                      files={sortedFiles}
                      onFolderClick={handleFolderClick}
                      onDownload={downloadFile}
                      onDelete={deleteFile}
                      onRename={handleRename}
                      onPreview={setPreviewFile}
                      viewMode={viewMode}
                      selectedFiles={selectedFiles}
                      onSelectFile={handleSelectFile}
                      onSelectAll={handleSelectAll}
                      onClearSelection={handleClearSelection}
                      onDeleteSelected={handleDeleteSelected}
                    />
                  )}
                </>
              )}
            </main>
          </DropZone>
        </SidebarInset>

        {/* File preview modal */}
        <FilePreviewModal
          file={previewFile}
          files={sortedFiles}
          onClose={() => setPreviewFile(null)}
          onDownload={downloadFile}
          onNavigate={handlePreviewNavigate}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
          multiple
        />

        {/* Folder dialog */}
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
              <Button onClick={handleCreateFolder} disabled={!folderName.trim()} className="gradient-primary">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
