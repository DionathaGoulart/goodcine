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
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json();
}

// Garante que todos os itens tenham media_type definido
function withMovieType(result: TMDBSearchResult): TMDBSearchResult {
  return { ...result, results: result.results.map(r => ({ ...r, media_type: r.media_type ?? 'movie' as const })) };
}
function withTVType(result: TMDBSearchResult): TMDBSearchResult {
  return { ...result, results: result.results.map(r => ({ ...r, media_type: r.media_type ?? 'tv' as const })) };
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

  // Trending separado por tipo
  getTrendingMovies: async () => {
    const r = await fetchTMDB<TMDBSearchResult>('/trending/movie/day');
    return withMovieType(r);
  },

  getTrendingTV: async () => {
    const r = await fetchTMDB<TMDBSearchResult>('/trending/tv/day');
    return withTVType(r);
  },

  // Top rated — fallback quando não há recomendações personalizadas
  getTopRatedMovies: async () => {
    const r = await fetchTMDB<TMDBSearchResult>('/movie/top_rated');
    return withMovieType(r);
  },

  getTopRatedTV: async () => {
    const r = await fetchTMDB<TMDBSearchResult>('/tv/top_rated');
    return withTVType(r);
  },

  // Lançamentos recentes
  getRecentMovies: async () => {
    const r = await fetchTMDB<TMDBSearchResult>('/movie/now_playing');
    return withMovieType(r);
  },

  getRecentTV: async () => {
    const r = await fetchTMDB<TMDBSearchResult>('/tv/on_the_air');
    return withTVType(r);
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
