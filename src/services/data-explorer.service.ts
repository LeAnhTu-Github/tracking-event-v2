import { z } from 'zod';

import {
  APPS_ENDPOINT,
  DROPPED_USERS_ENDPOINT,
  EVENTS_SEARCH_ENDPOINT,
  LEVELS_ENDPOINT
} from '@/lib/endpoints';
import type {
  DroppedUsersResponse,
  EventsSearchParams,
  EventsSearchResponse,
  TrackingApp,
  TrackingEventRow
} from '@/features/data-explorer/types';

const readJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const trackingAppSchema = z.object({
  id: z.number(),
  name: z.string()
});

const trackingEventRowSchema: z.ZodType<TrackingEventRow> = z.object({
  id: z.number(),
  event_name: z.string(),
  created_at: z.string(),
  key_info: z.string().catch('-'),
  event_json: z.unknown()
});

const eventsSearchResponseSchema: z.ZodType<EventsSearchResponse> = z.object({
  success: z.boolean(),
  data: z.array(trackingEventRowSchema).catch([]),
  pagination: z
    .object({
      current_page: z.number(),
      total_pages: z.number(),
      total_records: z.number(),
      limit: z.number().optional()
    })
    .optional()
});

const normalizePagination = (input: unknown, params: EventsSearchParams) => {
  const paginationSchema = z.object({
    current_page: z.number().optional(),
    total_pages: z.number().optional(),
    total_records: z.number().optional(),
    limit: z.number().optional()
  });

  const parsed = paginationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      current_page: params.page,
      total_pages: 1,
      total_records: 0,
      limit: params.limit
    };
  }

  return {
    current_page: parsed.data.current_page ?? params.page,
    total_pages: parsed.data.total_pages ?? 1,
    total_records: parsed.data.total_records ?? 0,
    limit: parsed.data.limit ?? params.limit
  };
};

const buildEventsSearchQuery = (params: EventsSearchParams) => {
  const query: URLSearchParams = new URLSearchParams({
    app_id: String(params.appId),
    page: String(params.page),
    limit: String(params.limit),
    start_date: params.startDate,
    end_date: params.endDate
  });

  if (params.keyword) query.append('keyword', params.keyword);
  if (params.eventName) query.append('event_name', params.eventName);
  if (params.level) query.append('level', params.level);

  return query;
};

const dataExplorerService = {
  getApps: async (): Promise<TrackingApp[]> => {
    const res = await fetch(APPS_ENDPOINT);
    const json = await readJson(res);
    const parsed = z.array(trackingAppSchema).safeParse(json);
    return parsed.success ? parsed.data : [];
  },

  getLevels: async (appId: number): Promise<string[]> => {
    const res = await fetch(LEVELS_ENDPOINT(appId));
    const json = await readJson(res);
    const parsed = z.union([z.array(z.string()), z.object({ data: z.array(z.string()) })]).safeParse(json);
    if (!parsed.success) return [];
    return Array.isArray(parsed.data) ? parsed.data : parsed.data.data;
  },

  getDroppedUsers: async (params: {
    appId: number;
    level: string;
    startDate: string;
    endDate: string;
  }): Promise<DroppedUsersResponse> => {
    const query = new URLSearchParams({
      level: params.level,
      start_date: params.startDate,
      end_date: params.endDate
    });

    const res = await fetch(`${DROPPED_USERS_ENDPOINT(params.appId)}?${query.toString()}`);
    const json = await readJson(res);

    const schema: z.ZodType<DroppedUsersResponse> = z.object({
      success: z.boolean(),
      total_start: z.number().catch(0),
      total_win: z.number().catch(0),
      dropped_count: z.number().catch(0),
      dropped_uuids: z.array(z.string()).catch([]),
      error: z.string().optional()
    });

    const parsed = schema.safeParse(json);
    if (parsed.success) return parsed.data;

    return {
      success: false,
      total_start: 0,
      total_win: 0,
      dropped_count: 0,
      dropped_uuids: [],
      error: 'Dropped users API response invalid'
    };
  },

  searchEvents: async (params: EventsSearchParams) => {
    const query = buildEventsSearchQuery(params);
    const res = await fetch(`${EVENTS_SEARCH_ENDPOINT}?${query.toString()}`);
    const json = await readJson(res);

    const parsed = eventsSearchResponseSchema.safeParse(json);
    if (parsed.success) {
      return {
        ...parsed.data,
        pagination: normalizePagination(parsed.data.pagination, params)
      };
    }

    const fallbackData = Array.isArray((json as any)?.data)
      ? (json as any).data
      : [];
    const fallbackParsed = z.array(trackingEventRowSchema).safeParse(fallbackData);

    return {
      success: false,
      data: fallbackParsed.success ? fallbackParsed.data : [],
      pagination: normalizePagination((json as any)?.pagination, params)
    };
  }
};

export default dataExplorerService;

