export interface DiscoverSectionItem {
  image?: string | null;
  description: string;
}

export interface DiscoverData {
  id: number | string;
  name: string;
  type?: "story" | "elearning" | string;
  year?: string;
  short_description?: string;
  content_sections?: DiscoverSectionItem[];
  is_pinned?: boolean;
  is_highlight?: boolean;
  image?: string | string[];
  logo?: string;
  DiscoverLists?: any[];
}

export interface ServiceData {
  id: number | string;
  name: string;
  show_name?: number;
  header?: string;
  description?: string;
  short_description?: string;
  logo?: string;
  cover_image?: string;
  image?: string | string[];
  serviceListMains?: { id: number; description: string }[];
  span?: string;
}

export interface PortfolioProject {
  id: string | number;
  img: string;
  title: string;
  category: string;
  type: string;
  description: string;
  span: string;
  demo_url?: string;
}

export function getDiscoverImages(image?: string | string[]): string[] {
  if (!image) return [];
  if (Array.isArray(image)) return image.filter(Boolean);
  return [image];
}

export function getServiceImages(image?: string | string[]): string[] {
  if (!image) return [];
  if (Array.isArray(image)) return image.filter(Boolean);
  if (typeof image === "string") {
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // not JSON
    }
    return [image].filter(Boolean);
  }
  return [];
}

