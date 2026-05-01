import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [],
  site: 'https://rigocrypto.github.io',
  base: '/arbinexus',
  output: 'static',
  trailingSlash: 'always'
});
