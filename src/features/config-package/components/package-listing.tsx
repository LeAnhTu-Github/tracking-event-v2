'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { useMemo } from 'react';
import { PackageTable } from './package-tables';
import { columns } from './package-tables/columns';
import { usePackages } from '../hooks/use-packages';
import { useGames } from '@/hooks/use-games';
import { formatSort } from '@/lib/utils';
import { getSortingStateParser } from '@/lib/parsers';
import { Package } from '../types';

export default function PackageListingPage() {
  const [perPage] = useQueryState(
    'perPage',
    parseAsInteger
      .withOptions({ history: 'replace', shallow: true })
      .withDefault(50)
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
  const [packageCode] = useQueryState('packageCode', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [name] = useQueryState('name', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [packageType] = useQueryState('packageType', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });

  const sortingStateParser = useMemo(
    () =>
      getSortingStateParser<Package>()
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
  const numPageSize = useMemo(() => perPage || 50, [perPage]);

  const { data: games } = useGames();

  const gameOptions = useMemo(() => {
    return games?.map((game) => ({ value: game, label: game })) || [];
  }, [games]);

  const memoizedColumns = useMemo(
    () => columns(numPageIndex, numPageSize, gameOptions),
    [numPageIndex, numPageSize, gameOptions]
  );

  const filter = useMemo(() => {
    const f: any = {
      page: numPageIndex - 1,
      size: numPageSize
    };
    const sortVal = formatSort(sorting);
    if (sortVal?.length) f.sort = sortVal;
    if (gameId) f.gameId = gameId;
    if (packageCode) f.packageCode = packageCode;
    if (name) f.name = name;
    if (packageType) f.type = packageType;
    return f;
  }, [
    numPageIndex,
    numPageSize,
    gameId,
    packageCode,
    name,
    packageType,
    sorting
  ]);

  const { data: packageData, isLoading: isPackagesLoading } =
    usePackages(filter);

  return (
    <PackageTable
      data={packageData?.data || []}
      totalItems={packageData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isPackagesLoading}
      columns={memoizedColumns}
    />
  );
}
