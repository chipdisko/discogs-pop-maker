// Utility functions for Discogs URL parsing and API interactions

export interface DiscogsUrlInfo {
  type: 'release' | 'master' | 'artist' | 'label' | null;
  id: string | null;
}

export function parseDiscogsUrl(url: string): DiscogsUrlInfo {
  console.log('Parsing Discogs URL:', url);
  
  try {
    const urlObj = new URL(url);
    
    // Check if it's a discogs.com URL
    if (!urlObj.hostname.includes('discogs.com')) {
      console.error('Not a Discogs URL');
      return { type: null, id: null };
    }
    
    const pathParts = urlObj.pathname.split('/').filter(part => part !== '');
    
    // Pattern: /release/12345 or /release/12345-Artist-Title
    if (pathParts[0] === 'release' && pathParts[1]) {
      const id = pathParts[1].split('-')[0];
      console.log('Found release ID:', id);
      return { type: 'release', id };
    }
    
    // Pattern: /master/12345 or /master/12345-Artist-Title
    if (pathParts[0] === 'master' && pathParts[1]) {
      const id = pathParts[1].split('-')[0];
      console.log('Found master ID:', id);
      return { type: 'master', id };
    }
    
    // Pattern: /artist/12345 or /artist/12345-Artist-Name
    if (pathParts[0] === 'artist' && pathParts[1]) {
      const id = pathParts[1].split('-')[0];
      console.log('Found artist ID:', id);
      return { type: 'artist', id };
    }
    
    // Pattern: /label/12345 or /label/12345-Label-Name
    if (pathParts[0] === 'label' && pathParts[1]) {
      const id = pathParts[1].split('-')[0];
      console.log('Found label ID:', id);
      return { type: 'label', id };
    }
    
    // Pattern with language: /ja/release/12345
    if (pathParts.length > 2 && pathParts[0].length === 2) {
      const type = pathParts[1];
      if (['release', 'master', 'artist', 'label'].includes(type) && pathParts[2]) {
        const id = pathParts[2].split('-')[0];
        console.log(`Found ${type} ID with language prefix:`, id);
        return { type: type as any, id };
      }
    }
    
    console.error('Unable to parse Discogs URL pattern');
    return { type: null, id: null };
  } catch (error) {
    console.error('Error parsing URL:', error);
    return { type: null, id: null };
  }
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists: Array<{
    name: string;
    role?: string;
  }>;
  year?: number;
  genres?: string[];
  styles?: string[];
  tracklist?: Array<{
    position: string;
    title: string;
    duration?: string;
  }>;
  labels?: Array<{
    name: string;
    catno?: string;
  }>;
  formats?: Array<{
    name: string;
    qty: string;
    descriptions?: string[];
  }>;
  images?: Array<{
    uri: string;
    type: string;
    width: number;
    height: number;
  }>;
  country?: string;
  released?: string;
}

export function formatReleaseInfo(release: DiscogsRelease): string {
  const artists = release.artists.map(a => a.name).join(', ');
  const year = release.year || release.released?.split('-')[0] || 'Unknown';
  
  let info = `${artists} - ${release.title} (${year})\\n`;
  
  if (release.labels && release.labels.length > 0) {
    info += `Label: ${release.labels.map(l => l.name).join(', ')}\\n`;
  }
  
  if (release.formats && release.formats.length > 0) {
    info += `Format: ${release.formats.map(f => f.name).join(', ')}\\n`;
  }
  
  if (release.genres && release.genres.length > 0) {
    info += `Genres: ${release.genres.join(', ')}\\n`;
  }
  
  if (release.styles && release.styles.length > 0) {
    info += `Styles: ${release.styles.join(', ')}\\n`;
  }
  
  return info;
}