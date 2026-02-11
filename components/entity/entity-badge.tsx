import { EntityIcon } from '@/components/entity/entity-icon';
import { EntityImage } from '@/components/entity/entity-image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EntityBadgeProps {
  id: string;
  image?: string | null;
  icon?: string | null;
  name: string;
  color?: string | null;
}

export function EntityBadge({ id, image, icon, name, color }: EntityBadgeProps) {
  return (
    <Badge variant="outline" key={id} className={cn(color ? `bg-[${color}]` : '')}>
      {image && <EntityImage className="size-4" image={image} />}
      {!image && icon && <EntityIcon icon={icon} />}
      {name}
    </Badge>
  );
}
