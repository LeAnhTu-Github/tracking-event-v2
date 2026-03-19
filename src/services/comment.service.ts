import { api } from './api';
import { IComment, ICommentListResponse } from '@/types/comments.type';

const COMMENT_API_URL = '/comment';

interface IParams {
  pageIndex?: number;
  pageSize?: number;
  videoId?: number;
  userId?: number;
}

const commentService = {
  getComments: async (params: IParams) =>
    await api.get<ICommentListResponse>(`${COMMENT_API_URL}`, {
      params
    }),
  getCommentsByUser: async (params: IParams) =>
    await api.get<ICommentListResponse>(`${COMMENT_API_URL}/by-user`, {
      params
    }),

  toggleComment: async (commentId: number, data: { isBlocked: boolean }) =>
    await api.put(`${COMMENT_API_URL}/${commentId}`, data),

  deleteComment: async (commentId: number) =>
    await api.delete(`${COMMENT_API_URL}/${commentId}`)
};

export default commentService;
export type { IComment };
