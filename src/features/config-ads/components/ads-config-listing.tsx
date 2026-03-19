'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { AdsConfigTable } from './ads-config-tables';
import { columns } from './ads-config-tables/columns';
import { useAdsConfigs } from '../hooks/use-ads-configs';
import { formatSort } from '@/lib/utils';
import { getSortingStateParser } from '@/lib/parsers';
import type { AdsConfig, AdsConfigSearchParams } from '../types';
import { parseAsInteger } from 'nuqs';
import { useGames } from '@/hooks/use-games';

export default function AdsConfigListing() {
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
  const [configKey] = useQueryState('configKey', {
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
      getSortingStateParser<AdsConfig>()
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

  const filter = useMemo((): AdsConfigSearchParams => {
    const f: AdsConfigSearchParams = {
      page: numPageIndex - 1,
      size: numPageSize
    };
    const sortVal = formatSort(sorting);
    if (sortVal?.length) f.sort = sortVal;
    if (gameId) f.gameId = gameId;
    if (configKey) f.configKey = configKey;
    if (keyword) f.keyword = keyword;
    return f;
  }, [numPageIndex, numPageSize, gameId, configKey, keyword, sorting]);

  const {
    data: adsConfigData,
    isLoading: isAdsConfigsLoading,
    refetch: refetchAdsConfigs
  } = useAdsConfigs(filter);

  const handleReload = () => {
    refetchAdsConfigs();
  };

  return (
    <AdsConfigTable
      data={adsConfigData?.data || []}
      totalItems={adsConfigData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isAdsConfigsLoading}
      columns={memoizedColumns}
      onReload={handleReload}
      initialSorting={sorting}
    />
  );
}
