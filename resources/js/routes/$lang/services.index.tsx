import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const ServicesListPage = lazyRouteComponent(
  () => import("@/components/service/ServicesListPage"),
  "ServicesListPage",
);

export const Route = createFileRoute("/$lang/services/")({
  head: () => ({
    meta: [
      { title: "Semua Layanan & Solusi Digital — ASTA Digital Agency" },
      {
        name: "description",
        content:
          "Jelajahi kumpulan layanan dan solusi teknologi dari ASTA Digital Agency: Pembuatan website, aplikasi mobile iOS & Android, dan sistem informasi custom.",
      },
      {
        property: "og:title",
        content: "Semua Layanan & Solusi Digital — ASTA Digital Agency",
      },
      {
        property: "og:description",
        content:
          "Jelajahi kumpulan layanan dan solusi teknologi dari ASTA Digital Agency: Pembuatan website, aplikasi mobile iOS & Android, dan sistem informasi custom.",
      },
    ],
  }),
  component: ServicesListPage,
});
