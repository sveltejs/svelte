// Vitest config scoped to real-browser performance benchmarks.
//
// The benches live in `./benches/*.bench.js`, use Vitest's `bench()` API, and
// run inside headless Chromium via Playwright. Each bench has access to the
// real DOM and Svelte's source tree (Vitest resolves `svelte/internal/...`
// the same way the JSDOM test suite does — see `vitest.config.js` at the repo
// root).
//
// Run:
//   pnpm bench:browser              # all browser benches
//   pnpm bench:browser swap         # filter by name fragment

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

const pkg = JSON.parse(
	fs.readFileSync(path.join(REPO_ROOT, 'packages/svelte/package.json'), 'utf8')
);

export default defineConfig({
	// Pre-bundle these so the first test run isn't interrupted by a Vite reload
	// when it discovers them ("new dependencies optimized: esm-env, clsx").
	optimizeDeps: {
		include: ['esm-env', 'clsx']
	},
	resolve: {
		alias: [
			// Resolve `svelte` / `svelte/internal/client` / `svelte/internal/flags/...`
			// from the source tree, matching the root vitest config.
			{
				find: /^svelte\/?/,
				customResolver: (id) => {
					const key = id === 'undefined' ? '.' : id.replace('undefined', './');
					const exported = pkg.exports[key];
					if (!exported) return;
					return path.resolve(REPO_ROOT, 'packages/svelte', exported.browser ?? exported.default);
				}
			}
		]
	},
	test: {
		// Where the benches live and what counts as a bench file
		dir: __dirname,
		include: ['benches/**/*.bench.js'],

		// Browser mode — runs the benches in real Chromium via Playwright. The
		// `@vitest/browser` package is the dev dep that brings this in; the
		// `playwright` package was already installed.
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			name: 'chromium',
			screenshotFailures: false
		}
	}
});
