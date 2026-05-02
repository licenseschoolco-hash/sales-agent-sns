export type Platform = 'X' | 'Instagram' | 'Google' | 'LinkedIn' | 'Web';

export function generateSearchUrl(platform: string, query: string): string {
  const encodedQuery = encodeURIComponent(query);
  
  switch (platform.toUpperCase()) {
    case 'X':
      return `https://x.com/search?q=${encodedQuery}&f=user`;
    case 'INSTAGRAM':
      return `https://www.instagram.com/explore/tags/${encodedQuery}/`;
    case 'GOOGLE':
      return `https://www.google.com/search?q=${encodedQuery}`;
    case 'LINKEDIN':
      return `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}`;
    default:
      return `https://www.google.com/search?q=${encodedQuery}`;
  }
}

export function generateAccountUrl(platform: string, accountId: string): string | null {
  if (!accountId) return null;
  
  switch (platform.toUpperCase()) {
    case 'X':
      return `https://x.com/${accountId.replace('@', '')}`;
    case 'INSTAGRAM':
      return `https://www.instagram.com/${accountId.replace('@', '')}/`;
    default:
      return null;
  }
}
