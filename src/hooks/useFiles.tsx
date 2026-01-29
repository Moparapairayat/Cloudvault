import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileItem {
  id: string;
  user_id: string;
  name: string;
  size: number;
  mime_type: string | null;
  r2_key: string;
  parent_folder_id: string | null;
  is_folder: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useFiles(parentFolderId: string | null = null) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ['files', parentFolderId],
    queryFn: async () => {
      let query = supabase
        .from('files')
        .select('*')
        .is('deleted_at', null)
        .order('is_folder', { ascending: false })
        .order('name', { ascending: true });

      if (parentFolderId) {
        query = query.eq('parent_folder_id', parentFolderId);
      } else {
        query = query.is('parent_folder_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FileItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, parentFolderId }: { file: File; parentFolderId: string | null }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      if (parentFolderId) {
        formData.append('parentFolderId', parentFolderId);
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentFolderId }: { name: string; parentFolderId: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name,
          size: 0,
          r2_key: `${user.id}/folders/${Date.now()}-${name}`,
          parent_folder_id: parentFolderId,
          is_folder: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Folder created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });

  // Soft delete - moves to trash
  const softDeleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Moved to trash');
    },
    onError: (error: Error) => {
      toast.error(`Failed to move to trash: ${error.message}`);
    },
  });

  // Permanent delete
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Permanently deleted');
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const downloadFile = async (fileId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-download`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      window.open(result.url, '_blank');
    } catch (error) {
      toast.error(`Download failed: ${(error as Error).message}`);
    }
  };

  const renameMutation = useMutation({
    mutationFn: async ({ fileId, newName }: { fileId: string; newName: string }) => {
      const { error } = await supabase
        .from('files')
        .update({ name: newName })
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Rename failed: ${error.message}`);
    },
  });

  return {
    files,
    isLoading,
    error,
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    createFolder: createFolderMutation.mutate,
    isCreatingFolder: createFolderMutation.isPending,
    deleteFile: softDeleteMutation.mutate, // Now uses soft delete
    isDeleting: softDeleteMutation.isPending,
    permanentDelete: deleteMutation.mutate,
    isPermanentDeleting: deleteMutation.isPending,
    downloadFile,
    renameFile: renameMutation.mutate,
    isRenaming: renameMutation.isPending,
  };
}

// Hook for trash files
export function useTrashFiles() {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ['trash'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as FileItem[];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('files')
        .update({ deleted_at: null })
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('File restored');
    },
    onError: (error: Error) => {
      toast.error(`Restore failed: ${error.message}`);
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Permanently deleted');
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Get all trash files
      const { data: trashFiles, error: fetchError } = await supabase
        .from('files')
        .select('id')
        .not('deleted_at', 'is', null);

      if (fetchError) throw fetchError;

      // Delete each file permanently
      for (const file of trashFiles || []) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-delete`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId: file.id }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Trash emptied');
    },
    onError: (error: Error) => {
      toast.error(`Failed to empty trash: ${error.message}`);
    },
  });

  return {
    files,
    isLoading,
    error,
    restoreFile: restoreMutation.mutate,
    isRestoring: restoreMutation.isPending,
    permanentDelete: permanentDeleteMutation.mutate,
    isPermanentDeleting: permanentDeleteMutation.isPending,
    emptyTrash: emptyTrashMutation.mutate,
    isEmptyingTrash: emptyTrashMutation.isPending,
  };
}

export function useSearchFiles(searchQuery: string) {
  return useQuery({
    queryKey: ['files', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .is('deleted_at', null)
        .ilike('name', `%${searchQuery}%`)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as FileItem[];
    },
    enabled: searchQuery.length > 0,
  });
}
