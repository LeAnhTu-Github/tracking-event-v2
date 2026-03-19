import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/user.type';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  const getInitials = (name: string | undefined) => {
    if (!name) return 'CN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={user?.avatar || ''} alt={user?.fullName || ''} />
        <AvatarFallback className='rounded-lg'>
          {getInitials(user?.fullName)}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.fullName || ''}</span>
          <span className='truncate text-xs'>{user?.username || ''}</span>
        </div>
      )}
    </div>
  );
}
