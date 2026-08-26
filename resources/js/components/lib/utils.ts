import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html?: string): string {
  if (!html) return "";
  // Add a space after closing block-level tags so paragraphs don't run together
  return html
    .replace(/<\/(p|h[1-6]|li|blockquote|div|br)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

