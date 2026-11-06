// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { NodePackageImporter } from 'sass';

// https://astro.build/config
export default defineConfig({
  // Every page is prerendered to plain HTML at build time — no adapter, no SSR.
  output: 'static',
  // Published on GitHub Pages as a project site: https://imahh17.github.io/cosmere-verse/
  site: 'https://imahh17.github.io',
  base: '/cosmere-verse',
  integrations: [react()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // `pkg:dawuti` (in src/styles/_dawuti.scss) needs the Node package importer.
          importers: [new NodePackageImporter()],
          // Lets any component stylesheet write `@use 'mixins' as *;`
          // instead of a relative path that depends on its folder depth.
          loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
        },
      },
    },
  },
});
