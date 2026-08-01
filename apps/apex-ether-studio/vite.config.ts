import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const githubPagesBase = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  ? `/${repositoryName}/`
  : '/';

export default defineConfig({
  base: githubPagesBase,
  plugins: [{
    name: 'github-pages-spa-fallback',
    closeBundle() {
      copyFileSync(resolve(appRoot, 'dist/index.html'), resolve(appRoot, 'dist/404.html'));
    },
  }],
});
