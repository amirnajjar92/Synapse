// Google Search result type
export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayedLink: string;
}

// YouTube video result type
export interface YouTubeVideo {
  url: {
    link: string;
  };
  reference: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

// API response types
export interface GoogleSearchResponse {
  results: GoogleSearchResult[];
  error?: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  error?: string;
}
