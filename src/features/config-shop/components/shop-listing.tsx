'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useMemo } from 'react';
import { ShopTable } from './shop-tables';
import { columns } from './shop-tables/columns';
import { useShops } from '../hooks/use-shops';
import { useGames } from '@/hooks/use-games';
import { formatSort } from '@/lib/utils';
import { getSortingStateParser } from '@/lib/parsers';
import type { Shop, ShopSearchParams } from '../types';

const getOptionalBoolean = (value: string): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export default function ShopListingPage() {
  const [perPage] = useQueryState(
    'perPage',
    parseAsInteger
      .withOptions({ history: 'replace', shallow: true })
      .withDefault(20)
  );
  const [pageIndex] = useQueryState(
    'page',
    parseAsInteger
      .withOptions({ history: 'replace', shallow: true })
      .withDefault(1)
  );
  const [gameId] = useQueryState('gameId', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [name] = useQueryState('name', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [type] = useQueryState('type', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [isActive] = useQueryState('isActive', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });

  const sortingStateParser = useMemo(
    () =>
      getSortingStateParser<Shop>()
        .withOptions({
          history: 'replace',
          shallow: true,
          clearOnDefault: true
        })
        .withDefault([]),
    []
  );

  const [sorting] = useQueryState('sort', sortingStateParser);

  const numPageIndex = useMemo(() => pageIndex || 1, [pageIndex]);
  const numPageSize = useMemo(() => perPage || 20, [perPage]);

  const { data: games } = useGames();

  const gameOptions = useMemo(() => {
    return games?.map((game) => ({ value: game, label: game })) || [];
  }, [games]);

  const memoizedColumns = useMemo(
    () => columns(numPageIndex, numPageSize, gameOptions),
    [numPageIndex, numPageSize, gameOptions]
  );

  const filter = useMemo((): ShopSearchParams => {
    const f: ShopSearchParams = {
      page: numPageIndex - 1,
      size: numPageSize
    };
    const sortVal = formatSort(sorting);
    if (sortVal?.length) f.sort = sortVal;
    if (gameId) f.gameId = gameId;
    if (name) f.name = name;
    if (type) f.type = type;
    const activeValue = getOptionalBoolean(isActive);
    if (activeValue !== undefined) f.isActive = activeValue;
    return f;
  }, [numPageIndex, numPageSize, gameId, name, type, isActive, sorting]);

  const { data: shopData, isLoading: isShopsLoading } = useShops(filter);

  return (
    <ShopTable
      data={shopData?.data || []}
      totalItems={shopData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isShopsLoading}
      columns={memoizedColumns}
    />
  );
}
