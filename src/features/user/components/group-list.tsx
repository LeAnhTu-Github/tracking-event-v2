import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Group } from '@/types/user.type';
import CreateGroupDialog from './create-group-dialog';

interface GroupListProps {
  groups: Group[];
  selectedGroupId: number | null;
  onGroupSelect: (groupId: number) => void;
  onGroupCreated: () => void;
}

export default function GroupList({
  groups,
  selectedGroupId,
  onGroupSelect,
  onGroupCreated
}: GroupListProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Group List</CardTitle>
        <CreateGroupDialog onGroupCreated={onGroupCreated} />
      </CardHeader>

      <CardContent>
        <div className='flex flex-col gap-2'>
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroupId === group.id ? 'default' : 'outline'}
              className='justify-start'
              onClick={() => onGroupSelect(group.id)}
            >
              {group.groupName}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
