'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { ConfigImageTable } from './config-image-table';
import { columns } from './columns';
import { useConfigImages } from '../hooks/use-config-images';

import { useGames } from '@/hooks/use-games';

import { useState } from 'react';

export default function ConfigImageListingPage() {
  const [perPage, setPerPage] = useQueryState('perPage', {
    defaultValue: '20',
    history: 'push'
  });
  const [pageIndex, setPageIndex] = useQueryState('page', {
    defaultValue: '1',
    history: 'push'
  });

  // Client-side managed filters
  const [gameId, setGameId] = useState('');
  const [type, setType] = useState('');

  const numPageIndex = useMemo(() => Number(pageIndex) || 1, [pageIndex]);
  const numPageSize = useMemo(() => Number(perPage) || 20, [perPage]);

  const filters = useMemo(() => {
    const f: any = {
      pageIndex: numPageIndex,
      pageSize: numPageSize
    };
    if (gameId && gameId !== 'all') f.gameId = gameId;
    if (type && type !== 'all') f.type = type;
    return f;
  }, [numPageIndex, numPageSize, gameId, type]);

  const { data: configData, isLoading, refetch } = useConfigImages(filters);

  const { data: games } = useGames();

  const gameOptions = useMemo(() => {
    return games?.map((game) => ({ value: game, label: game })) || [];
  }, [games]);

  const typeOptions = useMemo(
    () => [
      { value: 'INDIVIDUAL', label: 'INDIVIDUAL' },
      { value: 'GENERAL', label: 'GENERAL' }
    ],
    []
  );

  const configListData = useMemo(() => {
    if (!configData) return [];
    if (Array.isArray(configData)) return configData;
    if (Array.isArray((configData as any).data))
      return (configData as any).data;
    return [];
  }, [configData]);

  const totalRecords = useMemo(() => {
    if (!configData) return 0;
    if (typeof (configData as any).totalRecords === 'number')
      return (configData as any).totalRecords;
    if (typeof (configData as any).total === 'number')
      return (configData as any).total;
    if (Array.isArray(configData)) return configData.length;
    return 0;
  }, [configData]);

  const handleReload = () => {
    setPageIndex('1');
    setPerPage('20');
    setGameId('');
    setType('');
    refetch();
  };

  const memoizedColumns = useMemo(
    () => columns(numPageIndex, numPageSize, gameOptions, typeOptions),
    [numPageIndex, numPageSize, gameOptions, typeOptions]
  );

  return (
    <ConfigImageTable
      data={configListData}
      totalItems={totalRecords}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isLoading}
      columns={memoizedColumns}
      onReload={handleReload}
      gameId={gameId}
      onGameIdChange={setGameId}
      gameOptions={gameOptions}
      type={type}
      onTypeChange={setType}
      typeOptions={typeOptions}
    />
  );
}
