import { useEffect, useState } from 'react';
import userService from '@/services/user.service';
import { TGroupDetail } from '@/types/user.type';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import groupService from '@/services/group.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PaginationBase } from '@/components/shared/PaginationBase';
import { toast } from 'sonner';

type TUser = {
  id: number;
  name: string;
  username: string;
  phone: string;
  position: null;
  status: string;
};

type TProps = {
  selectedUsers: number[];
  groupDetail: TGroupDetail;
  setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
};

export function UserTable({
  groupDetail,
  selectedUsers,
  setSelectedUsers
}: TProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  });
  const [users, setUsers] = useState<TUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (groupDetail) {
      const ids = groupDetail.users.map((item) => item.id);
      setSelectedUsers(ids);
    }
  }, [groupDetail, setSelectedUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const filters = {
          pageSize: pagination.pageSize,
          pageIndex: pagination.pageIndex
        };
        const data = await userService.getUsers(filters);

        const cookedData = data.data.map((user) => ({
          id: user.id,
          name: user.fullName,
          username: user.username,
          phone: user.phone,
          position: null,
          status: user.status === 'ACTIVE' ? 'Active' : 'Inactive'
        }));
        setUsers(cookedData);

        setTotalUsers(data.totalRecords);
      } catch (error) {
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const isAllSelected =
    users.length > 0 && selectedUsers.length === users.length;
  const isPartiallySelected = selectedUsers.length > 0 && !isAllSelected;

  const isUserChecked = (userId: number) => selectedUsers.includes(userId);

  return (
    <div className='space-y-4'>
      <Table className='overflow-hidden rounded'>
        <TableHeader className='bg-muted'>
          <TableRow>
            <TableHead className='min-w-[50px] text-center'>
              <Checkbox
                checked={
                  isAllSelected || (isPartiallySelected && 'indeterminate')
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className='w-[100px]'>No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className='text-center'>Phone</TableHead>
            <TableHead className='text-center'>Position</TableHead>
            <TableHead className='text-center'>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className='h-4 w-4' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-8' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-32' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-40' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-4' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='h-24 text-center'>
                No data available
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className='min-w-[50px] text-center'>
                  <Checkbox
                    checked={isUserChecked(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== user.id)
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  {(pagination.pageIndex - 1) * pagination.pageSize + index + 1}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell className='text-center'>{user.phone}</TableCell>
                <TableCell className='text-center'>-</TableCell>
                <TableCell className='text-center'>
                  <Badge
                    variant={
                      user.status === 'Active' ? 'default' : 'destructive'
                    }
                    className={
                      user.status === 'Active'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <PaginationBase
        totalItems={totalUsers}
        pagination={pagination}
        setPagination={setPagination}
      />
    </div>
  );
}

export default function UpdateGroupDialog({
  groupDetail,
  fetchGroupDetail
}: {
  groupDetail: TGroupDetail;
  fetchGroupDetail: () => Promise<void>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState(() => {
    return groupDetail.users.map((item) => item.id);
  });

  const handleUpdateGroup = async () => {
    setIsSubmitting(true);
    try {
      const body = {
        id: groupDetail.group.id,
        userIds: selectedUsers.join(',')
      };
      await groupService.updateAccountUser(body);
      await fetchGroupDetail();
      toast.success('Group users updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update group users');
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>Update account list</Button>
      </DialogTrigger>

      <DialogContent className='overflow-hidden rounded-2xl p-4 md:max-w-3xl md:p-6 lg:max-w-5xl'>
        <DialogTitle className='mb-2'>Update account list</DialogTitle>
        <UserTable
          groupDetail={groupDetail}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />

        <DialogFooter>
          <Button
            variant='outline'
            disabled={isSubmitting}
            onClick={() => setIsDialogOpen(false)}
          >
            Close
          </Button>
          <Button disabled={isSubmitting} onClick={handleUpdateGroup}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
