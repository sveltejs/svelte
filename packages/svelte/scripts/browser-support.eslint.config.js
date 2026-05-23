// ESLint config used exclusively by `scripts/generate-browser-support.js`.
// Kept separate from the repo's main eslint config so the Baseline rule
// does not run as part of normal `pnpm lint`.
//
// The `target` is overridden by the generator at runtime as it searches
// for the lowest Baseline year / status the scanned code satisfies.

import baselineJs from 'eslint-plugin-baseline-js';

/**
 * @param {'widely' | 'newly' | number} target
 *   `'widely'` — Baseline Widely available
 *   `'newly'`  — Baseline Newly available
 *   `number`   — a Baseline year, e.g. `2024`
 */
export function config(target) {
	// The plugin's `recommended` preset enables Web API and JS builtin
	// detection on top of the syntax-level checks the bare rule does.
	// Without it we would miss APIs like `Element.prototype.append`,
	// `replaceChildren`, `Proxy`, etc., which is the whole point here.
	return [
		{
			languageOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		{ plugins: { 'baseline-js': baselineJs } },
		baselineJs.configs.recommended({ available: target, level: 'error' })
	];
}
