export type HardLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface ImagePoolItem {
  id: number;
  type: 'NORMAL' | 'VIP';
}

export interface LevelItem {
  id: number;
  gameId: string;
  levelNumber: number;
  name: string;
  countdown: number;
  boardType: number;
  boardSize: number;
  emptyCount: number;
  hardLevel: HardLevel;
  isVideo: boolean | null;
  sexyLevel: number | null;
  vipCount: number;
  normalCount: number;
  mostPlayedCount: number;
  imagePool: ImagePoolItem[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface LevelCreatePayload {
  gameId: string;
  levelNumber: number;
  name: string;
  countdown: number;
  boardType: number;
  boardSize: number;
  emptyCount: number;
  hardLevel: HardLevel;
  isVideo: boolean;
  sexyLevel: number;
  vipCount: number;
  normalCount: number;
  mostPlayedCount: number;
  imagePool: { id: number; type: string }[];
}

export interface LevelFilter {
  gameId?: string;
  levelNumber?: number;
  hardLevel?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface LevelResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: LevelItem[];
}
