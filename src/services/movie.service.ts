import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';

const MOVIE_API_URL = '/video';

interface Params {
  categoryCode?: string;
  languageCode?: string;
  genreCode?: string;
  categoryId?: string;
  pageIndex?: number;
  pageSize?: number;
}

interface INameMovie {
  title: string;
  langCode: string;
}

export type TMovie = {
  id: number;
  name: INameMovie[];
  slug: string;
  thumbnailUrl: string;
  backdrop: string;
  videoUrl: string;
  duration: number;
  isSeries: boolean;
  seriesPart: number;
  categories: [string];
  isPremium: boolean;
  viewCount: number;
  rating: number;
  ratingCount: number;
  status: string;
  publishedAt: string;
  tmbdMovieId: number;
};

export type TMovieCategory = {
  id: number;
  name: string;
  isPrimary: boolean;
};

export type TMovieTranslation = {
  languageCode: string;
  title: string;
  description?: string;
};

export type TMovieEpisode = {
  id: number;
  videoUrl: string;
  duration?: number;
  seriesPart: number;
  isPremium: boolean;
  viewCount?: number;
  status: string;
  publishedAt?: string;
  translations: TMovieTranslation[];
};

export type TMovieEpisodeBody = {
  id?: number;
  videoUrl: string;
  duration?: number;
  seriesPart: number;
  isPremium: boolean;
  status: string;
  publishedAt?: string;
  translations: TMovieTranslation[];
  videoId: string;
  viewCount?: number;
};

export type TMovieDetail = {
  id: number;
  slug: string | null;
  additionInformation: string;
  genreName: string | null;
  genres: string;
  thumbnailUrl: string;
  backdrop: string;
  videoUrl: string;
  duration: number;
  isSeries: boolean;
  seriesName: string | null;
  seriesPart: number;
  categories: TMovieCategory[];
  isPremium: boolean;
  viewCount: number;
  rating: number;
  ratingCount: number;
  status: string;
  publishedAt: string;
  translations: TMovieTranslation[];
  episodes: TMovieEpisode[];
  tmdbMovieId: number | null;

  //
  cast: string | null;
  director: string | null;
  releaseDate: string | null;
};

// TMDB
export interface TMDBMovieCollection {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBMovie {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: TMDBMovieCollection | null;
  budget: number;
  genres: TMDBGenre[];
  homepage: string | null;
  id: number;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TMDBMovieTv extends TMDBMovie {
  original_name: string;
}

export interface IBodyMovie {
  slug?: string;
  thumbnailUrl: string;
  backdrop: string;
  videoUrl?: string;
  isSeries: boolean;
  seriesPart?: number;
  categories?: {
    categoryId: number;
    isPrimary: boolean;
  }[];
  isPremium: boolean;
  status?: string;
  translations: TMovieTranslation[];
  additionInformation: string;
  releaseDate?: string;
}

export interface ICountry {
  id: number;
  code: string;
  name: string;
}

const movieService = {
  getMovies: async (params: Params) => {
    const response = await api.get<ApiResponsePagination<TMovie>>(
      `${MOVIE_API_URL}/list`,
      {
        params
      }
    );
    return response;
  },

  getMovieDetail: async (id: number) => {
    const response = await api.get<TMovieDetail>(`${MOVIE_API_URL}/list/${id}`);
    return response;
  },

  createMovie: async (body: IBodyMovie) => {
    return await api.post<any>(`${MOVIE_API_URL}/create`, body);
  },

  updateMovie: async (movieId: number, body: IBodyMovie) => {
    await api.post(`${MOVIE_API_URL}/${movieId}`, body);
  },

  getMovieTmdb: async (id: string) => {
    const response = await api.get<TMDBMovie>(`/video-series/tmdb/raw/${id}`);
    return response;
  },

  saveMovieTmdb: async (id: string) => {
    await api.post(`/video-series/tmdb/craw/${id}`);
  },

  deteleMovie: async (id: number) => {
    await api.delete(`${MOVIE_API_URL}/${id}`);
  },

  approvalMovie: async (params: { ids: number; status: string }) => {
    await api.put(
      `${MOVIE_API_URL}/updateStatus?ids=${params.ids}&status=${params.status}`
    );
  },

  // Episode
  addEpisode: async (body: TMovieEpisodeBody) => {
    await api.post(`${MOVIE_API_URL}/episode`, body);
  },

  updateEpisode: async (episodeId: number, body: TMovieEpisodeBody) => {
    await api.put(`${MOVIE_API_URL}/episode/${episodeId}`, body);
  },

  deteleEpisode: async (episodeId: number) => {
    await api.delete(`${MOVIE_API_URL}/episode/${episodeId}`);
  },

  // Country
  getCountries: async () => {
    const response = await api.get<ICountry[]>('/video-genre?languageCode=en');
    return response;
  },

  // TMDB TV
  getMovieTmdbTv: async (id: string) => {
    const response = await api.get<TMDBMovieTv>(
      `/video-series/tmdb/raw/tv/${id}`
    );
    return response;
  },

  saveMovieTmdbTv: async (id: string) => {
    await api.post(`/video-series/tmdb/craw/tv/${id}`);
  }
};

export default movieService;
