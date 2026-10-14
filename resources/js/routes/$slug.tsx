import { createFileRoute, redirect } from "@tanstack/react-router";

// Direct root URL handling: domain.com/judul-artikel -> redirects to /:lang/:slug
export const Route = createFileRoute("/$slug")({
  beforeLoad: ({ params }: { params: { slug?: string } }) => {
    const slug = params?.slug;
    // If the slug is 'id' or 'en', don't redirect here
    if (!slug || slug === "id" || slug === "en") {
      return;
    }

    // Determine current language from localStorage or fallback to 'id'
    let lang = "id";
    try {
      const stored = localStorage.getItem("asta_lang");
      if (stored === "en" || stored === "id") {
        lang = stored;
      }
    } catch {
      // ignore
    }

    throw redirect({
      href: `/${lang}/${slug}`,
      replace: true,
    });
  },
  component: () => null,
});
