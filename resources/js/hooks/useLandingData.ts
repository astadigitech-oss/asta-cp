import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface DiscoverListItem {
  id: number;
  description: string;
}

export interface DiscoverData {
  id: number;
  name: string;
  category?: string;
  date?: string;
  year?: string;
  short_description?: string;
  show_name?: number;
  is_pinned?: boolean;
  is_highlight?: boolean;
  logo?: string;
  image?: string | string[];
  DiscoverLists?: DiscoverListItem[];
}

export interface ClientItem {
  id: number;
  name: string;
  image?: string;
}

export interface ServiceItem {
  id: number | string;
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
  created_at?: string;
  updated_at?: string;
  seo?: any;
}

export interface PortfolioItem {
  id: number | string;
  slug?: string;
  name: string;
  description?: string;
  image?: string;
  image_small?: string;
  category?: string;
  type?: string;
  demo_url?: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  role?: string;
  org?: string;
  quote: string;
  source_url?: string;
  avatar?: string;
  tag?: string;
  rating?: number;
}

export interface ArticleItem {
  id: number;
  title: string | { id?: string; en?: string };
  slug: string;
  thumbnail: string | null;
  excerpt: string | null | { id?: string; en?: string };
  author: string;
  category: string;
  published_at: string;
}

export interface LandingData {
  clients?: ClientItem[];
  services?: ServiceItem[];
  portfolios?: PortfolioItem[];
  discovers?: DiscoverData[];
  testimonials?: TestimonialItem[];
  articles?: ArticleItem[];
}

/**
 * Shared hook untuk fetch data landing page.
 * Menggunakan React Query dengan key yang sama di semua komponen,
 * sehingga hanya ada 1 HTTP request ke /api/landing - tidak peduli
 * berapa banyak komponen yang menggunakan hook ini.
 */
export function useLandingData() {
  return useQuery<LandingData>({
    queryKey: ["landing"],
    queryFn: () =>
      axios.get<LandingData>("/api/landing").then((res) => res.data),
    staleTime: 60 * 1000,     // 1 menit agar navigasi antar halaman instan
    gcTime: 10 * 60 * 1000,   // 10 menit simpan di memory
    refetchOnWindowFocus: false, // Hindari lag/re-fetch berlebihan saat buka-tutup layar di mobile
    retry: 1,
  });
}
