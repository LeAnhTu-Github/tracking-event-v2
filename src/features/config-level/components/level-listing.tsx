'use client';

import { useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';
import { LevelTable } from './level-tables';
import { columns } from './level-tables/columns';
import { useLevels } from '../hooks/use-levels';
import { useGames } from '@/hooks/use-games';
import { formatSort } from '@/lib/utils';
import { getSortingStateParser } from '@/lib/parsers';
import { LevelItem } from '@/types/level.type';
import { parseAsInteger } from 'nuqs';

export default function LevelListingPage() {
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
  const [levelNumber] = useQueryState('levelNumber', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });
  const [hardLevel] = useQueryState('hardLevel', {
    defaultValue: '',
    history: 'replace',
    shallow: true
  });

  const sortingStateParser = useMemo(
    () =>
      getSortingStateParser<LevelItem>()
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
    if (levelNumber) f.levelNumber = Number(levelNumber);
    if (hardLevel) f.hardLevel = hardLevel;
    return f;
  }, [numPageIndex, numPageSize, gameId, levelNumber, hardLevel, sorting]);

  const {
    data: levelData,
    isLoading: isLevelsLoading,
    refetch: refetchLevels
  } = useLevels(filter);

  const handleReload = () => {
    refetchLevels();
  };

  return (
    <LevelTable
      data={levelData?.data || []}
      totalItems={levelData?.totalRecords || 0}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      isLoading={isLevelsLoading}
      columns={memoizedColumns}
      onReload={handleReload}
      initialSorting={sorting}
    />
  );
}
