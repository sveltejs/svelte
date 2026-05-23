// ESLint config used exclusively by `scripts/generate-browser-support.js`.
// Kept separate from the repo's main eslint config so the Baseline rule
// does not run as part of normal `pnpm lint`.
//
// The `target` is overridden by the generator at runtime as it searches
// for the lowest Baseline year / status the scanned code satisfies.

import baseline_js from 'eslint-plugin-baseline-js';

/**
 * @param {'widely' | 'newly' | number} target
 *   `'widely'` — Baseline Widely available
 *   `'newly'`  — Baseline Newly available
 *   `number`   — a Baseline year, e.g. `2024`
 * @returns {import('eslint').Linter.Config[]}
 */
export function config(target) {
	// The plugin's `recommended` preset enables Web API and JS builtin
	// detection on top of the syntax-level checks the bare rule does.
	// Without it we would miss APIs like `Element.prototype.append`,
	// `replaceChildren`, `Proxy`, etc., which is the whole point here.
	//
	// The preset returns readonly tuples for `files`, which ESLint's
	// `Config` type rejects — spread them into plain mutable arrays.
	const recommended = baseline_js.configs.recommended({
		available: target,
		level: 'error'
	});

	// `eslint-plugin-baseline-js` ships imprecise types: its `Plugin.configs`
	// values are functions rather than config objects, and its rules are
	// typed as `Record<string, unknown>`. Cast at the boundaries so the
	// caller sees the standard ESLint config shape.
	const plugin = /** @type {import('eslint').ESLint.Plugin} */ (
		/** @type {unknown} */ (baseline_js)
	);
	const rules = /** @type {import('eslint').Linter.RulesRecord} */ (
		/** @type {unknown} */ (recommended.rules)
	);

	return [
		{
			languageOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		{ plugins: { 'baseline-js': plugin } },
		{
			files: [...recommended.files],
			rules
		}
	];
}
