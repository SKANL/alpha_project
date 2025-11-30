// @ts-check
// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';


import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Habilita SSR para todo el proyecto
  adapter: node({
    mode: 'standalone',
  }),

  image: {
    domains: ['supabase.co', 'localhost'], // Add your actual Supabase project domain here
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  vite: {
    plugins: [],
    optimizeDeps: {
      include: ["picocolors"],
    },
  },

  integrations: [tailwind()]
});