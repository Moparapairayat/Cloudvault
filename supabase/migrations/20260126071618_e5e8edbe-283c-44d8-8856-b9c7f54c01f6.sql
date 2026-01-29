-- Create files table to store file metadata
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  r2_key TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  is_folder BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_parent_folder ON public.files(parent_folder_id);
CREATE INDEX idx_files_name ON public.files(name);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Users can only see their own files
CREATE POLICY "Users can view their own files"
ON public.files
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert their own files"
ON public.files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update their own files"
ON public.files
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON public.files
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();