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
  image?: string | string[];
  serviceListMains?: { id: number; description: string }[];
}

export interface PortfolioItem {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
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
  avatar?: string;
  tag?: string;
  rating?: number;
}

export interface LandingData {
  clients?: ClientItem[];
  services?: ServiceItem[];
  portfolios?: PortfolioItem[];
  discovers?: DiscoverData[];
  testimonials?: TestimonialItem[];
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
    staleTime: 5 * 60 * 1000, // cache 5 menit
    gcTime: 10 * 60 * 1000,   // garbage collect setelah 10 menit
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
