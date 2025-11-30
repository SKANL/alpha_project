// @ts-check
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Habilita SSR para todo el proyecto

  image: {
    domains: ['supabase.co', 'localhost'], // Add your actual Supabase project domain here
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [tailwind()]
});