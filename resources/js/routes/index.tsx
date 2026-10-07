import { createFileRoute, redirect } from "@tanstack/react-router";

// Root "/" redirect ke "/$lang" menggunakan bahasa default (id)
// Deteksi bahasa dari localStorage/cookie/browser jika tersedia
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Cek bahasa yang tersimpan
    let lang = "id";
    try {
      const stored = localStorage.getItem("asta_lang");
      if (stored === "en" || stored === "id") lang = stored;
    } catch {
      // ignore
    }
    throw redirect({ to: "/$lang", params: { lang }, replace: true });
  },
  component: () => null,
});

