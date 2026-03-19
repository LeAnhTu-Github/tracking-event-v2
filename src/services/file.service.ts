import { api } from './api';

interface TfileRes {
  fileUrl: string;
}

const fileService = {
  uploadFile: async (formData: FormData) =>
    await api.post<TfileRes>(`/file/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

export default fileService;
