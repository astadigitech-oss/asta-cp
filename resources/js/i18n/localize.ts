import { Language } from "./LanguageContext";

/**
 * Helper to parse and extract multi-language content from single database text fields.
 * No backend database changes required.
 *
 * Supported Admin Input Formats:
 * 1. Shortcode Delimiters (Recommended & easiest to type):
 *    [:id]Teks bahasa Indonesia[:en]English text[:]
 *    or:
 *    [:id]Teks bahasa Indonesia[:en]English text
 *
 * 2. Tag Pairs (Great for WYSIWYG / Rich Text editors):
 *    [ID]Teks bahasa Indonesia[/ID][EN]English text[/EN]
 *    or lowercase: [id]...[/id][en]...[/en]
 *
 * 3. HTML Comment Tags (Zero-impact in WYSIWYG editors):
 *    <!--id-->Teks bahasa Indonesia<!--/id--><!--en-->English text<!--/en-->
 *
 * Fallback:
 * - Returns matching language if found.
 * - Falls back to the opposite language if current lang is not specified.
 * - Falls back to original untagged text if no markers are present.
 */
export function localizeText(text?: string | null, lang: Language = "id"): string {
  if (!text || typeof text !== "string") return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  // 1. Delimiter style: [:id]...[:en]... (or trailing [:])
  if (/\[:(id|en)\]/i.test(trimmed)) {
    const parts = trimmed.split(/\[:(id|en)\]/i);
    // Resulting parts: ["", "id", "content...", "en", "content..."]
    const dict: Record<string, string> = {};
    for (let i = 1; i < parts.length; i += 2) {
      const tag = parts[i].toLowerCase();
      let val = parts[i + 1] || "";
      // Remove trailing [:] marker if present
      val = val.replace(/\[:\]$/, "").trim();
      dict[tag] = val;
    }
    if (dict[lang]) return dict[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (dict[fallback]) return dict[fallback];
  }

  // 2. Tag pairs: [id]...[/id] or [en]...[/en]
  const tagRegex = /\[(id|en)\]([\s\S]*?)\[\/\1\]/gi;
  if (tagRegex.test(trimmed)) {
    const tagMatches: Record<string, string> = {};
    let m: RegExpExecArray | null;
    const re = /\[(id|en)\]([\s\S]*?)\[\/\1\]/gi;
    while ((m = re.exec(trimmed)) !== null) {
      tagMatches[m[1].toLowerCase()] = m[2].trim();
    }
    if (tagMatches[lang]) return tagMatches[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (tagMatches[fallback]) return tagMatches[fallback];
  }

  // 3. HTML comment pairs: <!--id-->...<!--/id--> or <!--en-->...<!--/en-->
  const commentRegex = /<!--(id|en)-->([\s\S]*?)<!--\/\1-->/gi;
  if (commentRegex.test(trimmed)) {
    const commentMatches: Record<string, string> = {};
    let m: RegExpExecArray | null;
    const re = /<!--(id|en)-->([\s\S]*?)<!--\/\1-->/gi;
    while ((m = re.exec(trimmed)) !== null) {
      commentMatches[m[1].toLowerCase()] = m[2].trim();
    }
    if (commentMatches[lang]) return commentMatches[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (commentMatches[fallback]) return commentMatches[fallback];
  }

  // 4. Default: No tags detected, return raw text unchanged
  return text;
}

