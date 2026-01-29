import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export function Breadcrumbs({ currentFolderId, onNavigate }: BreadcrumbsProps) {
  const { data: breadcrumbs = [] } = useQuery({
    queryKey: ['breadcrumbs', currentFolderId],
    queryFn: async (): Promise<BreadcrumbItem[]> => {
      if (!currentFolderId) return [];

      const path: BreadcrumbItem[] = [];
      let currentId: string | null = currentFolderId;

      while (currentId) {
        const { data, error } = await supabase
          .from('files')
          .select('id, name, parent_folder_id')
          .eq('id', currentId)
          .single();

        if (error || !data) break;

        path.unshift({ id: data.id, name: data.name });
        currentId = data.parent_folder_id;
      }

      return path;
    },
    enabled: !!currentFolderId,
  });

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={() => onNavigate(null)}
      >
        <Home className="w-4 h-4 mr-1" />
        My Drive
      </Button>
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={index === breadcrumbs.length - 1 ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onNavigate(item.id)}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  );
}
