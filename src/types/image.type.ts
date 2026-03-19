// Annotation types (matching ImageAnnotationView)
export interface AnnotationGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export type LabelType = 'face' | 'chest_breast' | 'groin_pubic';

export interface Annotation {
  geometry: AnnotationGeometry;
  bbox_px: BBox;
  bbox_norm: BBox;
  thumbnail: string;
  id: number;
  label: LabelType | '';
}

// Status types
export type ImageStatus = 'ACTIVE' | 'INACTIVE';
export type SyncStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type ImageType = 'REVIEW' | 'PRODUCT';

// API Response types
export interface SensitiveRegionDetection {
  id: number;
  label: string;
  confidence: number;
  occluded: boolean;
  bbox_px: BBox;
  bbox_norm: BBox;
  polygon_px: { x: number; y: number }[];
}

export interface SensitiveRegionsMetadata {
  version: string;
  image: {
    width: number;
    height: number;
  };
  detections: SensitiveRegionDetection[];
}

export interface MediaApiResponse {
  id: number;
  thumbnailUrl: string;
  imageUrl?: string;
  downloadImageUrl?: string;
  videoUrl?: string | null;
  vip: boolean;
  sexyLevel: number;
  totalPlay: number;
  totalLike: number;
  totalDownload: number;
  active: boolean;
  type: string;
  sensitiveRegionsProcessed: boolean;
  embedded: boolean;
  esSynced: boolean;
  createdAt: string;
  updatedAt: string;
  gameId?: string;
  // NOTE: API currently returns `metaData` (capital D). Keep both for flexibility.
  metaData?: Record<string, any>;
  metadata?: Record<string, any>;
  // API returns embedding as a JSON string; we keep it flexible here.
  embedding?: string | Record<string, any>;
  sensitiveRegionsMetadata?: SensitiveRegionsMetadata;
}

export interface MediaListApiResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: MediaApiResponse[];
  item: Record<string, any> | null;
}

export interface MediaListApiWrapper {
  timestamp: string;
  traceId: string;
  code: string;
  message: string;
  data: MediaListApiResponse;
}

export interface MediaDetailApiWrapper {
  timestamp: string;
  traceId: string;
  code: string;
  message: string;
  data: MediaApiResponse;
}

export interface MediaFilters {
  keyword?: string;
  vip?: boolean;
  type?: string;
  active?: boolean;
  processed?: boolean;
  esSynced?: boolean;
  gameId?: string;
}

// Main Image interface (for internal use, transformed from API)
export interface Image {
  id: number;
  thumbnailUrl: string;
  vipImageUrl?: string;
  imageUrl?: string;
  downloadImageUrl?: string;
  videoUrl?: string;
  isVip: boolean;
  levelSexy: number;
  playCount: number;
  likeCount: number;
  downloadCount: number;
  status: ImageStatus;
  metadata: Record<string, any>;
  metadataGenStatus?: SyncStatus;
  embedding: Record<string, any>;
  embeddingStatus?: SyncStatus;
  annotations: Annotation[];
  annotationSyncStatus?: SyncStatus;
  elasticsearchSyncStatus?: SyncStatus;
  createdAt: string;
  updatedAt: string;
  type?: string;
  gameId: string;
}

export interface CloudflareUploadResponse {
  at: string;
  url: string;
}
