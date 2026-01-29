import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Cloud } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface StorageUsageProps {
  collapsed?: boolean;
}

export function StorageUsage({ collapsed = false }: StorageUsageProps) {
  const { data: usage } = useQuery({
    queryKey: ['storage-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('size');

      if (error) throw error;

      const totalBytes = data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;
      const fileCount = data?.length || 0;

      return { totalBytes, fileCount };
    },
  });

  // 15GB storage limit (example)
  const storageLimit = 15 * 1024 * 1024 * 1024;
  const usedBytes = usage?.totalBytes || 0;
  const percentage = Math.min((usedBytes / storageLimit) * 100, 100);

  if (collapsed) {
    return (
      <div className="p-2 flex items-center justify-center">
        <div className="relative">
          <Cloud className="w-6 h-6 text-primary" />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-primary/30"
            style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
          >
            <div className="w-full h-full bg-primary rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <HardDrive className="w-4 h-4 text-primary" />
        <span>Storage</span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatBytes(usedBytes)} used</span>
        <span>{formatBytes(storageLimit - usedBytes)} free</span>
      </div>

      <div className="text-xs text-muted-foreground">
        {usage?.fileCount || 0} files stored
      </div>
    </div>
  );
}
