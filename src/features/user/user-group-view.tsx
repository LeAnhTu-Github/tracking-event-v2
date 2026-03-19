'use client';

import { useCallback, useEffect, useState } from 'react';
import GroupList from './components/group-list';
import GroupDetail from './components/group-detail';
import groupService from '@/services/group.service';
import { Group, TGroupDetail } from '@/types/user.type';
import PageContainer from '@/components/layout/page-container';

export default function UserGroupView() {
  const [groupList, setGroupList] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupDetail, setGroupDetail] = useState<TGroupDetail | null>(null);

  const fetchGroupList = async () => {
    try {
      const groups = await groupService.getGroups();
      setGroupList(groups);
      if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroupList();
  }, []);

  const fetchGroupDetail = useCallback(async () => {
    if (!selectedGroupId) return;
    try {
      const detail = await groupService.getGroupById(selectedGroupId);
      setGroupDetail(detail);
    } catch (error) {
      console.error(error);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    fetchGroupDetail();
  }, [fetchGroupDetail]);

  return (
    <PageContainer>
      <div className='grid w-full grid-cols-12 gap-4'>
        <div className='col-span-12 lg:col-span-4'>
          <GroupList
            groups={groupList}
            selectedGroupId={selectedGroupId}
            onGroupSelect={setSelectedGroupId}
            onGroupCreated={fetchGroupList}
          />
        </div>

        <div className='col-span-12 lg:col-span-8'>
          {groupDetail && (
            <GroupDetail
              groupDetail={groupDetail}
              fetchGroupList={fetchGroupList}
              fetchGroupDetail={fetchGroupDetail}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
