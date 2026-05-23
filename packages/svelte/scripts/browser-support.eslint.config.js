// ESLint config used exclusively by `scripts/generate-browser-support.js`.
// Kept separate from the repo's main eslint config so the Baseline rule
// does not run as part of normal `pnpm lint`.
//
// The `target` is overridden by the generator at runtime as it searches
// for the lowest Baseline year / status the scanned code satisfies.

import baseline_js from 'eslint-plugin-baseline-js';
import ts_parser from '@typescript-eslint/parser';

/**
 * Features that the type-aware scan reports but that should not bump the
 * floor. Each entry MUST have a justification — either the API is
 * feature-detected with a safe fallback, or the plugin's web-features
 * dataset is wrong, or the API is reached only by a specific runtime
 * branch and is documented in the "Per-feature browser requirements"
 * section of the docs page.
 *
 * Treat changes to this list with suspicion — every entry weakens the
 * floor's claim.
 */
const IGNORE_FEATURES = [
	// `globalThis?.window?.trustedTypes && trustedTypes.createPolicy(...)`
	// in `src/internal/client/dom/reconciler.js`. Feature-detected with
	// `?.` — the runtime no-ops when Trusted Types is unavailable.
	'trusted-types',

	// False positive: the plugin's web-features dataset marks
	// `devicepixelratio` as Baseline `false` because Safari is missing
	// from its `support` map, but `window.devicePixelRatio` has been
	// shipped in every Safari since the property existed. Used in
	// `src/reactivity/window/index.js`.
	'devicepixelratio',

	// `structuredClone()` in `src/internal/shared/clone.js` (lines 108
	// and 129). Only invoked when `$state.snapshot()` is called with
	// `Date` or non-JSON-serializable values; the primitive code path
	// never reaches it. Documented in the docs page under
	// "Per-feature browser requirements" with its Baseline-2022 floor.
	'structured-clone'
];

/**
 * @param {'widely' | 'newly' | number} target
 *   `'widely'` — Baseline Widely available
 *   `'newly'`  — Baseline Newly available
 *   `number`   — a Baseline year, e.g. `2024`
 * @param {{ tsconfig: string, root: string }} [type_info]
 *   When provided, the Baseline rule runs in type-aware mode using
 *   `@typescript-eslint/parser` with the given tsconfig. This catches
 *   instance-method calls like `String.prototype.replaceAll` and
 *   `Array.prototype.toSorted` that the non-typed preset misses.
 * @returns {import('eslint').Linter.Config[]}
 */
export function config(target, type_info) {
	// `recommended-ts` enables `preset: 'type-aware'` for Web API + JS builtin
	// detection. Without type info the rule degrades to syntax-only checks,
	// which is why we always pair it with `@typescript-eslint/parser` and a
	// real tsconfig pointing at the files being linted.
	const preset = type_info
		? baseline_js.configs['recommended-ts']({
				available: target,
				level: 'error'
			})
		: baseline_js.configs.recommended({
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

	// The preset's rule entry already has the `available` option set, but
	// not `ignoreFeatures`. Replace the rule so both options are present.
	const rules = /** @type {import('eslint').Linter.RulesRecord} */ ({
		.../** @type {Record<string, unknown>} */ (preset.rules),
		'baseline-js/use-baseline': [
			'error',
			{
				available: target,
				ignoreFeatures: IGNORE_FEATURES,
				...(type_info
					? {
							includeWebApis: { preset: 'type-aware' },
							includeJsBuiltins: { preset: 'type-aware' }
						}
					: { includeWebApis: { preset: 'auto' }, includeJsBuiltins: { preset: 'auto' } })
			}
		]
	});

	/** @type {import('eslint').Linter.Config[]} */
	const layers = [
		{ plugins: { 'baseline-js': plugin } },
		{
			files: [...preset.files],
			languageOptions: type_info
				? {
						parser: /** @type {import('eslint').Linter.Parser} */ (
							/** @type {unknown} */ (ts_parser)
						),
						parserOptions: {
							project: [type_info.tsconfig],
							tsconfigRootDir: type_info.root,
							ecmaVersion: 'latest',
							sourceType: 'module'
						}
					}
				: {
						ecmaVersion: 'latest',
						sourceType: 'module'
					},
			rules
		}
	];

	return layers;
}
