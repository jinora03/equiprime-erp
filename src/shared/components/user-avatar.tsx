import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/string";

interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  return (
    <Avatar className={cn(className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
