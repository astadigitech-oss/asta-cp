import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { LanguageProvider } from './i18n/useTranslation';
import '../css/app.css';
// Import OG image agar Vite memasukkannya ke manifest — dipakai Blade via Vite::asset()
import './assets/og-image.png';

// QueryClient instance yang akan di-share ke router context
const queryClient = new QueryClient();

// Inisialisasi router dengan context queryClient (required oleh __root.tsx)
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('react-app');
if (rootElement) {
  const initialData = (window as any).__INITIAL_DATA__;
  if (initialData?.article && initialData.slug) {
    queryClient.setQueryData(['article', String(initialData.slug)], initialData.article);
  }
  if (initialData?.discover && initialData.id) {
    queryClient.setQueryData(['discover', String(initialData.id)], initialData.discover);
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </LanguageProvider>
  );
}
