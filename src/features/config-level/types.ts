export type ImageType = 'NORMAL' | 'VIP';

export interface ImagePoolItem {
  url: string;
  type: ImageType;
}

export type HardLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface LevelConfig {
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
  isVip: boolean;
  totalImages: number;
  vipImages: number;
  normalImages: number;
  imagePool: ImagePoolItem[];
}

export interface Level {
  id: string;
  levelNumber: number;
  name: string;
  config: LevelConfig;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  levels: Level[];
}
