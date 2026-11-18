export interface DiscoverSectionItem {
  media_type?: "image" | "video";
  image?: string | null;
  video_url?: string | null;
  description: string;
}

export interface DiscoverData {
  id: number | string;
  name: string;
  slug?: string;
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
  slug?: string;
  name: string;
  show_name?: number;
  header?: string;
  description?: string;
  short_description?: string;
  logo?: string;
  cover_image?: string;
  image?: string | string[];
  serviceListMains?: { id: number; description: string; sort?: number }[];
  faqs?: { question: string; answer: string }[];
  span?: string;
  created_at?: string;
  updated_at?: string;
  seo?: any;
}

export interface PortfolioProject {
  id: string | number;
  slug?: string;
  img?: string;
  title: string;
  category: string;
  type: string;
  description: string;
  span: string;
  demo_url?: string;
}

export interface PortfolioData {
  id: number | string;
  slug?: string;
  name: string;
  description?: string;
  type?: "mobile" | "desktop" | string;
  category?: string;
  image?: string;
  image_small?: string;
  demo_url?: string;
  created_at?: string;
  updated_at?: string;
  other_portfolios?: Array<{
    id: number | string;
    name: string;
    type?: string;
    category?: string;
    image?: string;
    demo_url?: string;
  }>;
  seo?: any;
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

export interface DiscoverSectionItem {
  media_type?: "image" | "video";
  image?: string | null;
  video_url?: string | null;
  description: string;
}
