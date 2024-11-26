import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://www.storymode.ca',
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true
  })
});