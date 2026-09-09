import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages のプロジェクトサイトは /<repository>/ 配下で配信される。
  // import.meta.env.BASE_URL を使う地図データの URL にも同じ値が適用される。
  base: '/us-midterms-2026/',
});
