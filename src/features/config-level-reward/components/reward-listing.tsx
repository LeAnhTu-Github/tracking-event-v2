'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { RewardTable } from './reward-tables';
import { columns } from './reward-tables/columns';
import { useLevelRewards } from '../hooks/use-level-rewards';
import { useGames } from '@/hooks/use-games';
import { ConfigType, LevelReward } from '../types';
import { formatSort } from '@/lib/utils';
import { getSortingStateParser } from '@/lib/parsers';
import { parseAsInteger } from 'nuqs';

export default function RewardListingPage() {
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
  const [keyword] = useQueryState('keyword', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [configType] = useQueryState('configType', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });

  const sortingStateParser = useMemo(
    () =>
      getSortingStateParser<LevelReward>()
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
    if (keyword) f.keyword = keyword;
    if (configType) f.configType = configType as ConfigType;
    return f;
  }, [numPageIndex, numPageSize, gameId, keyword, configType, sorting]);

  const {
    data: rewardData,
    isLoading: isRewardsLoading,
    refetch: refetchRewards
  } = useLevelRewards(filter);

  const handleReload = () => {
    refetchRewards();
  };

  return (
    <RewardTable
      data={rewardData?.data || []}
      totalItems={rewardData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isRewardsLoading}
      columns={memoizedColumns}
      onReload={handleReload}
      initialSorting={sorting}
    />
  );
}
