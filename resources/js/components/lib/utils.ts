import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

export function stripHtml(html?: string): string {
  if (!html) return "";
  // Add a space after closing block-level tags so paragraphs don't run together
  const cleaned = html
    .replace(/<\/(p|h[1-6]|li|blockquote|div|br)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return decodeHtmlEntities(cleaned);
}

export function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  // RegEx untuk mengekstrak ID video dari URL YouTube
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  }

  if (url.includes("youtube.com/embed/")) {
    return url;
  }
  return null;
}