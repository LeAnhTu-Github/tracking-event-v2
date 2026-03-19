import { MediaFilters } from '@/types/image.type';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

type ImageStore = {
  filters: MediaFilters;
  pageIndex: number;
  pageSize: number;
  editingMetadata: Record<string, any> | null;
  editingEmbedding: Record<string, any> | null;
  editingAnnotation: any | null;
  setFilters: (filters: MediaFilters) => void;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  setEditingMetadata: (metadata: Record<string, any> | null) => void;
  setEditingEmbedding: (embedding: Record<string, any> | null) => void;
  setEditingAnnotation: (annotation: any | null) => void;
  clearEditingState: () => void;
  reset: () => void;
};

// Extracted for use in hooks
export const transformApiImage = (apiImage: any) => {
  const rawMeta: Record<string, any> =
    (apiImage.metaData as Record<string, any>) ||
    (apiImage.metadata as Record<string, any>) ||
    {};

  const formattedMetadata: Record<string, any> = {
    ...rawMeta,
    description: rawMeta.summary ?? rawMeta.description,
    category:
      rawMeta.category ??
      rawMeta.composition?.scene_type ??
      apiImage.type ??
      '',
    tags:
      rawMeta.tags ??
      rawMeta.outfit?.style_keywords ??
      (Array.isArray(rawMeta.tags) ? rawMeta.tags : [])
  };

  let embedding: Record<string, any> = {};
  if (typeof apiImage.embedding === 'string') {
    try {
      const parsed = JSON.parse(apiImage.embedding);
      embedding = {
        vector: Array.isArray(parsed) ? parsed : [],
        model: 'cms-embedding-v1'
      };
    } catch {
      embedding = { raw: apiImage.embedding };
    }
  } else if (apiImage.embedding) {
    embedding = apiImage.embedding as Record<string, any>;
  }

  const annotations =
    apiImage.sensitiveRegionsMetadata?.detections?.map(
      (det: any, index: number) => ({
        id: det.id ?? index,
        label: det.label as any,
        bbox_px: det.bbox_px,
        bbox_norm: det.bbox_norm,
        geometry: {
          x: det.bbox_norm.x,
          y: det.bbox_norm.y,
          width: det.bbox_norm.w,
          height: det.bbox_norm.h
        },
        thumbnail: apiImage.thumbnailUrl
      })
    ) ?? [];

  return {
    id: apiImage.id,
    thumbnailUrl: apiImage.thumbnailUrl,
    imageUrl: apiImage.imageUrl,
    downloadImageUrl: apiImage.downloadImageUrl,
    vipImageUrl: apiImage.imageUrl,
    videoUrl: apiImage.videoUrl ?? undefined,
    isVip: apiImage.vip,
    levelSexy: apiImage.sexyLevel,
    playCount: apiImage.totalPlay,
    likeCount: apiImage.totalLike,
    downloadCount: apiImage.totalDownload,
    status: apiImage.active ? 'ACTIVE' : 'INACTIVE',
    metadata: formattedMetadata,
    metadataGenStatus: rawMeta ? 'COMPLETED' : 'PENDING',
    embedding,
    embeddingStatus: apiImage.embedded ? 'COMPLETED' : 'PENDING',
    annotations,
    annotationSyncStatus: apiImage.sensitiveRegionsProcessed
      ? 'COMPLETED'
      : 'PENDING',
    elasticsearchSyncStatus: apiImage.esSynced ? 'COMPLETED' : 'PENDING',
    createdAt: apiImage.createdAt,
    updatedAt: apiImage.updatedAt,
    type: apiImage.type,
    gameId: apiImage.gameId || rawMeta.gameId || ''
  };
};

export const imageStore = createStore<ImageStore>()((set) => ({
  filters: {},
  pageIndex: 1,
  pageSize: 50,
  editingMetadata: null,
  editingEmbedding: null,
  editingAnnotation: null,
  setFilters: (filters: MediaFilters) => {
    set({ filters, pageIndex: 1 });
  },
  setPageIndex: (pageIndex: number) => {
    set({ pageIndex });
  },
  setPageSize: (pageSize: number) => {
    set({ pageSize, pageIndex: 1 });
  },
  setEditingMetadata: (metadata: Record<string, any> | null) => {
    set({ editingMetadata: metadata });
  },
  setEditingEmbedding: (embedding: Record<string, any> | null) => {
    set({ editingEmbedding: embedding });
  },
  setEditingAnnotation: (annotation: any | null) => {
    set({ editingAnnotation: annotation });
  },
  clearEditingState: () => {
    set({
      editingMetadata: null,
      editingEmbedding: null,
      editingAnnotation: null
    });
  },
  reset: () => {
    set({
      filters: {},
      pageIndex: 1,
      pageSize: 50,
      editingMetadata: null,
      editingEmbedding: null,
      editingAnnotation: null
    });
  }
}));

export const useImageStore = () => useStore(imageStore);
