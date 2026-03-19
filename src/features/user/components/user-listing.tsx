'use client';

import userService from '@/services/user.service';
import { User } from '@/types/user.type';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserTable } from './user-tables';
import { columns } from './user-tables/columns';

export default function UserListingPage() {
  const [pageSize, setPageSize] = useQueryState('pageSize', {
    defaultValue: '50',
    history: 'push'
  });
  const [status, setStatus] = useQueryState('status', {
    defaultValue: '',
    history: 'push'
  });
  const [pageIndex, setPageIndex] = useQueryState('page', {
    defaultValue: '1',
    history: 'push'
  });
  const [fullNameFilter, setFullNameFilter] = useQueryState('fullName', {
    history: 'push'
  });
  const [phoneFilter, setPhoneFilter] = useQueryState('phone', {
    history: 'push'
  });

  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        pageSize: Number(pageSize),
        pageIndex: Number(pageIndex),
        ...(fullNameFilter && { fullName: fullNameFilter }),
        ...(phoneFilter && { phone: phoneFilter }),
        ...(status && { status: String(status) })
      };
      const data = await userService.getUsers(filters);
      setUsers(data.data);
      setTotalUsers(data.totalRecords);
    } catch (error) {
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, pageIndex, status, fullNameFilter, phoneFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const memoizedColumns = useMemo(
    () => columns(Number(pageIndex), Number(pageSize), fetchUsers),
    [pageIndex, pageSize, fetchUsers]
  );

  return (
    <UserTable
      data={users}
      totalItems={totalUsers}
      pageIndex={Number(pageIndex)}
      pageSize={Number(pageSize)}
      isLoading={isLoading}
      columns={memoizedColumns}
      onReload={async () => {
        setPageIndex('1');
        setPageSize('50');
        setStatus('');
        setFullNameFilter(null);
        setPhoneFilter(null);
        await fetchUsers();
      }}
    />
  );
}
