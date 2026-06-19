import { TMDBSearchResult, TMDBDetail } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!TMDB_BEARER_TOKEN) {
    throw new Error('TMDB_BEARER_TOKEN não definido nas variáveis de ambiente.');
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('language', 'pt-BR');
  
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
    },
    // Usa a infra do Next.js de fetch caching (1 hora de cache)
    next: { revalidate: 3600 } 
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json();
}

export const tmdbClient = {
  searchMulti: (query: string, page: number = 1) => {
    return fetchTMDB<TMDBSearchResult>('/search/multi', {
      query,
      page: page.toString(),
      include_adult: 'false',
    });
  },

  getMovie: (id: string | number) => {
    return fetchTMDB<TMDBDetail>(`/movie/${id}`, {
      append_to_response: 'credits',
    });
  },

  getSeries: (id: string | number) => {
    return fetchTMDB<TMDBDetail>(`/tv/${id}`, {
      append_to_response: 'credits',
    });
  },

  getTrending: () => {
    return fetchTMDB<TMDBSearchResult>('/trending/all/day');
  },
  
  discoverMovies: (genreIds: string[]) => {
    return fetchTMDB<TMDBSearchResult>('/discover/movie', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
    });
  },
  
  discoverSeries: (genreIds: string[]) => {
    return fetchTMDB<TMDBSearchResult>('/discover/tv', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
    });
  }
};
