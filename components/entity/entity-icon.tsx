import { IconDisplay } from '@/components/ui/icon-display';

interface EntityIconProps {
  icon: string;
}

export function EntityIcon({ icon }: EntityIconProps) {
  return <IconDisplay name={icon} />;
}
