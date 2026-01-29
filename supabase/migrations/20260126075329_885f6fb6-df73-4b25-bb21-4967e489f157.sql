-- Add deleted_at column for soft delete functionality
ALTER TABLE public.files 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient trash queries
CREATE INDEX idx_files_deleted_at ON public.files(deleted_at);

-- Update RLS policies to include deleted files access for the owner
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
CREATE POLICY "Users can view their own files" 
ON public.files 
FOR SELECT 
USING (auth.uid() = user_id);