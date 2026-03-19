'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { ItemTable } from './item-tables';
import { columns } from './item-tables/columns';
import { useItems } from '../hooks/use-items';
import { formatSort } from '@/lib/utils';
import { getSortingStateParser } from '@/lib/parsers';
import { Item } from '../types';
import { parseAsInteger } from 'nuqs';

export default function ItemListing() {
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
  const [type] = useQueryState('type', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [keyword] = useQueryState('q', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });

  const sortingStateParser = useMemo(
    () =>
      getSortingStateParser<Item>()
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

  const memoizedColumns = useMemo(
    () => columns(numPageIndex, numPageSize),
    [numPageIndex, numPageSize]
  );

  const filter = useMemo(() => {
    const f: any = {
      page: numPageIndex - 1,
      size: numPageSize
    };
    const sortVal = formatSort(sorting);
    if (sortVal?.length) f.sort = sortVal;
    if (gameId) f.gameId = gameId;
    if (type) f.type = type;
    if (keyword) f.keyword = keyword;
    return f;
  }, [numPageIndex, numPageSize, gameId, type, keyword, sorting]);

  const {
    data: itemData,
    isLoading: isItemsLoading,
    refetch: refetchItems
  } = useItems(filter);

  const handleReload = () => {
    refetchItems();
  };

  return (
    <ItemTable
      data={itemData?.data || []}
      totalItems={itemData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isItemsLoading}
      columns={memoizedColumns}
      onReload={handleReload}
      initialSorting={sorting}
    />
  );
}
