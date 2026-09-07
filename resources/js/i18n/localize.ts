import { Language } from "./LanguageContext";

/**
 * Clean dangling unbalanced p/div tags created by splitting HTML around shortcodes
 */
function cleanHtmlSnippet(str: string): string {
  let cleaned = str.trim();
  // Remove orphan closing tags at beginning
  cleaned = cleaned.replace(/^(<\/(p|div|span|h[1-6]|li|ul|ol)>)+/i, "").trim();
  // Remove orphan opening tags at end
  cleaned = cleaned.replace(/(<(p|div|span|h[1-6]|li|ul|ol)[^>]*>)+$/i, "").trim();
  return cleaned;
}

/**
 * Helper to parse and extract multi-language content from single database text fields.
 * No backend database changes required.
 *
 * Supported Admin Input Formats:
 * 1. Shortcode Delimiters:
 *    [:id]Teks bahasa Indonesia[:en]English text[:]
 *    or [:ID]...[:EN]...
 *
 * 2. Tag Pairs:
 *    [ID]Teks bahasa Indonesia[/ID][EN]English text[/EN]
 *    or [id]...[/id][en]...[/en]
 *
 * 3. HTML Comment Tags:
 *    <!--id-->Teks bahasa Indonesia<!--/id--><!--en-->English text<!--/en-->
 *    <!--:id-->Teks bahasa Indonesia<!--:--><!--:en-->English text<!--:-->
 *
 * 4. Curly Tags:
 *    {{id}}Teks bahasa Indonesia{{/id}}{{en}}English text{{/en}}
 */
export function localizeText(text?: string | null, lang: Language = "id"): string {
  if (!text || typeof text !== "string") return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  // 1. Delimiter style: [:id]...[:en]... or [:ID]...[:EN]... (or trailing [:])
  if (/\[:\s*(id|en)\s*\]/i.test(trimmed)) {
    const parts = trimmed.split(/\[:\s*(id|en)\s*\]/i);
    // Resulting parts: ["", "id", "content...", "en", "content..."]
    const dict: Record<string, string> = {};
    for (let i = 1; i < parts.length; i += 2) {
      const tag = parts[i].toLowerCase().trim();
      let val = parts[i + 1] || "";
      // Remove trailing [:] marker if present
      val = val.replace(/\[:\s*\]$/, "").trim();
      dict[tag] = cleanHtmlSnippet(val);
    }
    if (dict[lang]) return dict[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (dict[fallback]) return dict[fallback];
  }

  // 2. Tag pairs: [id]...[/id] or [ID]...[/ID]
  const tagRegex = /\[\s*(id|en)\s*\]([\s\S]*?)\[\/\s*\1\s*\]/gi;
  if (tagRegex.test(trimmed)) {
    const tagMatches: Record<string, string> = {};
    let m: RegExpExecArray | null;
    const re = /\[\s*(id|en)\s*\]([\s\S]*?)\[\/\s*\1\s*\]/gi;
    while ((m = re.exec(trimmed)) !== null) {
      tagMatches[m[1].toLowerCase().trim()] = cleanHtmlSnippet(m[2]);
    }
    if (tagMatches[lang]) return tagMatches[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (tagMatches[fallback]) return tagMatches[fallback];
  }

  // 3. HTML comment pairs: <!--id-->...<!--/id--> or <!--:id-->...<!--:-->
  const commentRegex = /<!--\s*:?\s*(id|en)\s*-->([\s\S]*?)<!--\s*:?\/?\s*\1?\s*-->/gi;
  if (commentRegex.test(trimmed)) {
    const commentMatches: Record<string, string> = {};
    let m: RegExpExecArray | null;
    const re = /<!--\s*:?\s*(id|en)\s*-->([\s\S]*?)<!--\s*:?\/?\s*\1?\s*-->/gi;
    while ((m = re.exec(trimmed)) !== null) {
      commentMatches[m[1].toLowerCase().trim()] = cleanHtmlSnippet(m[2]);
    }
    if (commentMatches[lang]) return commentMatches[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (commentMatches[fallback]) return commentMatches[fallback];
  }

  // 4. Curly tags: {{id}}...{{/id}}
  const curlyRegex = /\{\{\s*(id|en)\s*\}\}([\s\S]*?)\{\{\/\s*\1\s*\}\}/gi;
  if (curlyRegex.test(trimmed)) {
    const curlyMatches: Record<string, string> = {};
    let m: RegExpExecArray | null;
    const re = /\{\{\s*(id|en)\s*\}\}([\s\S]*?)\{\{\/\s*\1\s*\}\}/gi;
    while ((m = re.exec(trimmed)) !== null) {
      curlyMatches[m[1].toLowerCase().trim()] = cleanHtmlSnippet(m[2]);
    }
    if (curlyMatches[lang]) return curlyMatches[lang];
    const fallback = lang === "id" ? "en" : "id";
    if (curlyMatches[fallback]) return curlyMatches[fallback];
  }

  // 5. Default: No tags detected, return raw text unchanged
  return text;
}
