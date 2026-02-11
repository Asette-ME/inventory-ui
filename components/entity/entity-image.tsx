import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface EntityImageProps {
  className?: string;
  image: string;
}

export function EntityImage({ className, image }: EntityImageProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={image} className="object-cover" />
    </Avatar>
  );
}
