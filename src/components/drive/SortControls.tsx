import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';

export type SortField = 'name' | 'size' | 'created_at' | 'mime_type';
export type SortOrder = 'asc' | 'desc';

interface SortControlsProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const sortOptions: { label: string; value: SortField }[] = [
  { label: 'Name', value: 'name' },
  { label: 'Size', value: 'size' },
  { label: 'Date modified', value: 'created_at' },
  { label: 'Type', value: 'mime_type' },
];

export function SortControls({ sortField, sortOrder, onSortChange }: SortControlsProps) {
  const currentSort = sortOptions.find(o => o.value === sortField);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground">
          <ArrowUpDown className="w-4 h-4" />
          <span className="hidden sm:inline">{currentSort?.label}</span>
          {sortOrder === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={sortField} onValueChange={(v) => onSortChange(v as SortField, sortOrder)}>
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => onSortChange(sortField, v as SortOrder)}>
          <DropdownMenuRadioItem value="asc">
            <ArrowUp className="w-4 h-4 mr-2" />
            Ascending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">
            <ArrowDown className="w-4 h-4 mr-2" />
            Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
