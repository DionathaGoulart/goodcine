export interface TMDBSearchResult {
  page: number;
  results: TMDBMedia[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMedia {
  id: number;
  title?: string;
  name?: string; // Para séries
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  popularity: number;
  release_date?: string;
  first_air_date?: string; // Para séries
  vote_average: number;
  vote_count: number;
}

export interface TMDBDetail extends TMDBMedia {
  genres: TMDBGenre[];
  status: string;
  tagline: string | null;
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  credits: {
    cast: TMDBCast[];
    crew: TMDBCrew[];
  };
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}
