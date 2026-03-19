'use client';

import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { ImageTable } from './image-tables';
import { columns } from './image-tables/columns';
import { useImageStore } from '@/store/useImage';
import { useImages } from '../hooks/use-images';
import { useGames } from '@/hooks/use-games';

export default function ImageListingPage() {
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
  const [q, setQ] = useQueryState('q', {
    defaultValue: '',
    history: 'push'
  });
  const [gameId, setGameId] = useQueryState('gameId', {
    defaultValue: '',
    history: 'push'
  });

  const {
    filters: storeFilters,
    pageIndex: storePageIndex,
    pageSize: storePageSize,
    setFilters,
    setPageIndex: setStorePageIndex,
    setPageSize: setStorePageSize
  } = useImageStore();

  const numPageIndex = useMemo(() => Number(pageIndex) || 1, [pageIndex]);
  const numPageSize = useMemo(() => Number(pageSize) || 50, [pageSize]);

  // Sync URL query params with store
  useEffect(() => {
    setStorePageIndex(numPageIndex);
  }, [numPageIndex, setStorePageIndex]);

  useEffect(() => {
    setStorePageSize(numPageSize);
  }, [numPageSize, setStorePageSize]);

  useEffect(() => {
    const newFilters: Record<string, any> = {};
    if (status === 'ACTIVE' || status === 'INACTIVE') {
      newFilters.active = status === 'ACTIVE';
    }
    if (q) {
      newFilters.keyword = q;
    }
    if (gameId) {
      newFilters.gameId = gameId;
    }
    setFilters(newFilters);
  }, [status, q, gameId, setFilters]);

  // React Query hooks
  const {
    data: imageData,
    isLoading: isImagesLoading,
    refetch: refetchImages
  } = useImages(storeFilters, storePageIndex, storePageSize);

  const { data: games } = useGames();

  const gameOptions = useMemo(() => {
    return games?.map((game) => ({ value: game, label: game })) || [];
  }, [games]);

  const handleReload = () => {
    setPageIndex('1');
    setPageSize('50');
    setStatus('');
    setQ('');
    setGameId('');
    refetchImages();
  };

  const memoizedColumns = useMemo(
    () => columns(numPageIndex, numPageSize, gameOptions),
    [numPageIndex, numPageSize, gameOptions]
  );

  return (
    <ImageTable
      data={imageData?.images || []}
      totalItems={imageData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isImagesLoading}
      columns={memoizedColumns}
      onReload={handleReload}
    />
  );
}
