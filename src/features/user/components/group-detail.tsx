import { toast } from 'sonner';
import { UserIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableHeader
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TGroupDetail } from '@/types/user.type';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import groupService from '@/services/group.service';
import { Card, CardContent } from '@/components/ui/card';
import { AlertModal } from '@/components/modal/alert-modal';
import permissionService from '@/services/permission.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpdateGroupDialog from './update-group-dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface IPageRole {
  id: number;
  name: string;
  active: boolean;
  permissions: {
    id: number;
    name: string;
    active: boolean;
  }[];
}

type TProps = {
  groupDetail: TGroupDetail;
  fetchGroupList: () => Promise<void>;
  fetchGroupDetail: () => Promise<void>;
};

const infoSchema = z.object({
  name: z.string().min(1, 'Please enter a valid name'),
  description: z.string().min(1, 'Please enter a valid description')
});

type InfoFormData = z.infer<typeof infoSchema>;

export default function GroupDetail({
  groupDetail,
  fetchGroupList,
  fetchGroupDetail
}: TProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageRoles, setPageRoles] = useState<IPageRole[]>([]);
  const [activePageId, setActivePageId] = useState<number>(1);
  const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: groupDetail?.group.groupName || '',
      description: groupDetail?.group.description || ''
    }
  });

  const handlePageCheck = (pageId: number) => {
    setPageRoles((prev) =>
      prev.map((item) =>
        item.id === pageId
          ? {
              ...item,
              active: !item.active,
              permissions: item.permissions.map((perm) => ({
                ...perm,
                active: !item.active
              }))
            }
          : item
      )
    );
    setActivePageId(pageId);
  };

  const handlePermissionCheck = useCallback(
    (permId: number) => {
      setPageRoles((prev) =>
        prev.map((page) => {
          if (page.id === activePageId) {
            const updatedPermissions = page.permissions.map((p) =>
              p.id === permId ? { ...p, active: !p.active } : p
            );
            return {
              ...page,
              permissions: updatedPermissions,
              active: updatedPermissions.some((p) => p.active)
            };
          }
          return page;
        })
      );
    },
    [activePageId]
  );

  const handleCheckAllPages = (checked: boolean) => {
    setPageRoles((prev) =>
      prev.map((page) => ({
        ...page,
        active: checked,
        permissions: page.permissions.map((perm) => ({
          ...perm,
          active: checked
        }))
      }))
    );
  };

  const handleCheckAllPermissions = useCallback(
    (checked: boolean) => {
      setPageRoles((prev) =>
        prev.map((page) =>
          page.id === activePageId
            ? {
                ...page,
                active: checked,
                permissions: page.permissions.map((perm) => ({
                  ...perm,
                  active: checked
                }))
              }
            : page
        )
      );
    },
    [activePageId]
  );

  const isAllPagesChecked = useMemo(() => {
    return pageRoles?.length > 0 && pageRoles?.every((page) => page.active);
  }, [pageRoles]);
  const isSomePagesChecked = useMemo(() => {
    return pageRoles.some((page) => page.active) && !isAllPagesChecked;
  }, [pageRoles, isAllPagesChecked]);

  const isAllPermissionsChecked = useMemo(() => {
    const page = pageRoles.find((p) => p.id === activePageId);
    if (!page) return false;
    return (
      page.permissions.length > 0 &&
      page.permissions.every((perm) => perm.active)
    );
  }, [pageRoles, activePageId]);

  const isSomePermissionsChecked = useMemo(() => {
    const page = pageRoles.find((p) => p.id === activePageId);
    if (!page) return false;
    return (
      page.permissions.length > 0 &&
      page.permissions.some((perm) => perm.active) &&
      !isAllPermissionsChecked
    );
  }, [activePageId, isAllPermissionsChecked, pageRoles]);

  const handleSave = async (data: InfoFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const groupPage = pageRoles
        .flatMap((page) =>
          page.active
            ? page.permissions
                .filter((perm) => perm.active)
                .map((perm) => `${page.id}-${perm.id}`)
            : []
        )
        .join(',');

      // Validation: require at least 1 page selected (matching Vue implementation)
      if (!groupPage) {
        toast.error('Vui lòng chọn ít nhất 1 trang');
        setIsSubmitting(false);
        return;
      }

      const body = {
        groupId: groupDetail.group.id,
        groupName: data.name,
        description: data.description,
        status: 1,
        groupPage
      };
      await groupService.updateGroup(body);
      await fetchGroupList();
      await fetchGroupDetail();
      toast.success('Cập nhật nhóm người dùng thành công');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await groupService.deleteGroup(groupDetail.group.id);
      await fetchGroupList();
      toast.success('Deleted group successfully');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
      setIsOpenConfirmDelete(false);
    }
  };

  useEffect(() => {
    const fetchPageRoles = async () => {
      try {
        setValue('name', groupDetail?.group.groupName);
        setValue('description', groupDetail?.group.description);

        const response = await permissionService.getPermissions();

        // Kiểm tra response có đúng structure không
        if (!response || !response.pages || !Array.isArray(response.pages)) {
          toast.error('Invalid permissions response');
          return;
        }
        const roles = response.roles || [];
        const cookedData = response.pages.map((item) => {
          const pagePermissions = roles
            .filter((role) => role.pageId === item.id)
            .map((role) => ({
              id: role.id,
              name: role.roleName,
              active: groupDetail?.pageRoles?.some(
                (pr) => pr.id === item.id && pr.roleId === role.id
              )
            }));

          return {
            id: item.id,
            name: item.pageName,
            active: groupDetail?.pageRoles?.some((pr) => pr.id === item.id),
            permissions: pagePermissions
          };
        });

        setPageRoles(cookedData);
        if (cookedData.length > 0) {
          setActivePageId(cookedData[0].id);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch permissions');
      }
    };
    fetchPageRoles();
  }, [
    groupDetail?.group.description,
    groupDetail?.group.groupName,
    groupDetail?.pageRoles,
    setValue
  ]);

  return (
    <>
      <Card>
        <CardContent>
          <Tabs defaultValue='group'>
            <TabsList className='mb-2 grid w-full grid-cols-2'>
              <TabsTrigger value='group'>Info</TabsTrigger>
              <TabsTrigger value='user'>Users</TabsTrigger>
            </TabsList>

            <TabsContent value='group'>
              <form className='space-y-2'>
                <div className='mb-1 flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='destructive'
                    disabled={isSubmitting}
                    onClick={() => setIsOpenConfirmDelete(true)}
                  >
                    Delete
                  </Button>

                  <Button
                    type='button'
                    disabled={isSubmitting}
                    onClick={handleSubmit(handleSave)}
                  >
                    Save
                  </Button>
                </div>
                <div>
                  <label className='mb-1 block font-medium' htmlFor='groupName'>
                    Group name
                  </label>
                  <Input id='groupName' {...register('name')} />
                  {errors.name && (
                    <p className='animate-in fade-in-50 text-sm text-red-500'>
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className='mb-1 block font-medium'
                    htmlFor='description'
                  >
                    Description
                  </label>
                  <Textarea id='description' {...register('description')} />
                  {errors.description && (
                    <p className='animate-in fade-in-50 text-sm text-red-500'>
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className='mt-8 grid grid-cols-1 gap-8 md:grid-cols-2'>
                  {/* Pages list */}
                  <div className='bg-card w-full overflow-hidden rounded-xl border shadow-md'>
                    <div className='bg-muted/80 flex w-full items-center border-b px-6 py-4'>
                      <Checkbox
                        className='mr-4'
                        checked={
                          isAllPagesChecked ||
                          (isSomePagesChecked && 'indeterminate')
                        }
                        onCheckedChange={handleCheckAllPages}
                      />
                      <div className='text-muted-foreground grow text-center text-base font-semibold tracking-wide'>
                        PAGES
                      </div>
                      <div />
                    </div>

                    <div
                      style={{
                        maxHeight: 'calc(100vh - 500px)',
                        overflowY: 'auto'
                      }}
                      className='divide-border divide-y'
                    >
                      {pageRoles?.map((page) => (
                        <div
                          key={page.id}
                          onClick={() => setActivePageId(page.id)}
                          className={`group hover:bg-muted/40 flex cursor-pointer items-center px-6 py-3.5 transition-all duration-200 ${
                            activePageId === page.id
                              ? 'bg-primary/5 border-l-primary border-l-4'
                              : ''
                          }`}
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className='flex items-center'
                          >
                            <Checkbox
                              className='mr-4'
                              checked={page.active}
                              onCheckedChange={() => handlePageCheck(page.id)}
                            />
                          </div>
                          <span className='text-foreground/90 group-hover:text-foreground text-sm font-medium select-none'>
                            {page.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permissions list */}
                  <div className='bg-card w-full rounded-xl border shadow-md'>
                    <div className='bg-muted/80 flex w-full items-center border-b px-6 py-4'>
                      <Checkbox
                        className='mr-4'
                        checked={
                          isAllPermissionsChecked ||
                          (isSomePermissionsChecked && 'indeterminate')
                        }
                        onCheckedChange={(checked) =>
                          handleCheckAllPermissions(!!checked)
                        }
                      />
                      <div className='text-muted-foreground grow text-center text-base font-semibold tracking-wide'>
                        PERMISSIONS
                      </div>
                      <div />
                    </div>

                    {activePageId && (
                      <div
                        style={{
                          maxHeight: 'calc(100vh - 500px)',
                          overflowY: 'auto'
                        }}
                      >
                        <div className='divide-border divide-y'>
                          {pageRoles
                            .find((p) => p.id === activePageId)
                            ?.permissions.map((perm) => (
                              <div
                                key={perm.id}
                                className='group hover:bg-muted/40 flex items-center px-6 py-3.5 transition-all duration-200'
                              >
                                <Checkbox
                                  checked={perm.active}
                                  onCheckedChange={() =>
                                    handlePermissionCheck(perm.id)
                                  }
                                  className='mr-4'
                                />
                                <span className='text-foreground/90 group-hover:text-foreground text-sm font-medium select-none'>
                                  {perm.name}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value='user'>
              <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold'>Users</h1>
                <UpdateGroupDialog
                  groupDetail={groupDetail}
                  fetchGroupDetail={fetchGroupDetail}
                />
              </div>

              <div className='mt-4'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!groupDetail?.users?.length ? (
                      <TableRow>
                        <TableCell colSpan={5} className='h-24 text-center'>
                          <div className='text-muted-foreground flex flex-col items-center justify-center gap-2'>
                            <UserIcon size={24} />
                            <p>No users in this group</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupDetail.users.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === 'ACTIVE'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                user.status === 'ACTIVE'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                              }
                            >
                              {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <AlertModal
        loading={isSubmitting}
        onConfirm={handleDelete}
        isOpen={isOpenConfirmDelete}
        onClose={() => setIsOpenConfirmDelete(false)}
        title='Confirm Delete'
        description={
          <div className='space-y-1'>
            <p className='text-foreground text-lg font-medium'>
              Are you sure you want to delete group{' '}
              <span className='text-destructive font-bold'>
                {groupDetail.group.groupName}
              </span>
              ?
            </p>
            <p className='text-muted-foreground text-sm'>
              This action cannot be undone.
            </p>
          </div>
        }
      />
    </>
  );
}
