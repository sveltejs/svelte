// ESLint config used exclusively by `scripts/generate-browser-support.js`.
// Kept separate from the repo's main eslint config so the Baseline rule
// does not run as part of normal `pnpm lint`.
//
// The `target` is overridden by the generator at runtime as it searches
// for the lowest Baseline year / status the scanned code satisfies.

import baseline_js from 'eslint-plugin-baseline-js';
import ts_parser from '@typescript-eslint/parser';

/**
 * Suppressions that should NEVER affect the floor regardless of whether
 * the runtime currently uses the API. Two reasons an entry belongs here:
 *
 *   - The plugin's `web-features` dataset misclassifies the API. Example:
 *     `devicepixelratio` is marked Baseline `false` because Safari is
 *     missing from its `support` map, but the property has shipped in
 *     every Safari for over a decade.
 *
 *   - Svelte feature-detects the API at runtime with `?.` and degrades
 *     gracefully when it's unavailable. Users on browsers without the
 *     API see no breakage, so requiring it would overstate the floor.
 *     Example: `trusted-types` in `src/internal/client/dom/reconciler.js`.
 *
 * These are exempt from the staleness check below — if Svelte stops
 * using the API, removing the entry is fine but not required.
 */
export const SAFE_TO_IGNORE = [
	'devicepixelratio',
	// `globalThis?.window?.trustedTypes && trustedTypes.createPolicy(...)`
	// in `src/internal/client/dom/reconciler.js`. Feature-detected with
	// `?.` — the runtime no-ops when Trusted Types is unavailable.
	'trusted-types'
];

/**
 * Suppressions for features that DO live in the runtime but are reached
 * only via a specific code path that's documented in the per-feature
 * table on the docs page. The aggregate scan hides them so the headline
 * floor reflects "load Svelte and use the basic runtime", not "use every
 * conditional feature".
 *
 * Each entry MUST appear in the conditional-features table on the docs
 * page (auto-generated from `find_all_conditional_features`). The
 * staleness check below also verifies the entry is still present in the
 * runtime bundle — if the scanner doesn't flag it, the entry can be
 * removed.
 */
export const BEHAVIORAL_IGNORE = [
	// `structuredClone()` in `src/internal/shared/clone.js`. Only invoked
	// when `$state.snapshot()` is called with `Date` or non-JSON-serializable
	// values. The `$state.snapshot()` fixture detects it and produces a row
	// in the conditional-features table.
	'structured-clone'
];

/** Aggregate ignore list — used for the headline floor. */
export const IGNORE_FEATURES = [...SAFE_TO_IGNORE, ...BEHAVIORAL_IGNORE];

/**
 * Ignore list for the IGNORE_FEATURES staleness check. Lets BEHAVIORAL
 * entries be visible to the scan so we can confirm they're still in the
 * runtime; SAFE_TO_IGNORE entries are pre-filtered because the staleness
 * check doesn't apply to them.
 */
export const STALENESS_CHECK_IGNORE = SAFE_TO_IGNORE;

/**
 * Ignore list for per-fixture scans. Suppresses SAFE entries but NOT
 * BEHAVIORAL ones — the per-fixture pass needs to see
 * `structured-clone` etc. so it can emit the conditional row.
 */
export const PER_FIXTURE_IGNORE = SAFE_TO_IGNORE;

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
 * @param {{ purpose: 'aggregate' | 'staleness-check' | 'per-fixture' }} [options]
 *   `'aggregate'` (default) uses the full IGNORE_FEATURES list — the
 *   floor reflects "load Svelte without using conditional features".
 *   `'staleness-check'` excludes only SAFE entries, so the scan can
 *   verify BEHAVIORAL entries are still flagged in the runtime.
 *   `'per-fixture'` excludes only SAFE entries, so per-feature fixtures
 *   detect the BEHAVIORAL APIs they actually need.
 * @returns {import('eslint').Linter.Config[]}
 */
export function config(target, type_info, options) {
	const ignore_list =
		options?.purpose === 'staleness-check'
			? STALENESS_CHECK_IGNORE
			: options?.purpose === 'per-fixture'
				? PER_FIXTURE_IGNORE
				: IGNORE_FEATURES;

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

	const rules = /** @type {import('eslint').Linter.RulesRecord} */ ({
		.../** @type {Record<string, unknown>} */ (preset.rules),
		'baseline-js/use-baseline': [
			'error',
			{
				available: target,
				ignoreFeatures: ignore_list,
				...(type_info
					? {
							includeWebApis: { preset: 'type-aware' },
							includeJsBuiltins: { preset: 'type-aware' }
						}
					: { includeWebApis: { preset: 'auto' }, includeJsBuiltins: { preset: 'auto' } })
			}
		]
	});

	// The `recommended-ts` preset's `files` glob targets `**/*.{ts,tsx}`,
	// but Svelte's source is `.js` with JSDoc types. Broaden the glob when
	// type info is available so the rule actually runs against `.js` files.
	const files_glob = type_info ? ['**/*.{js,ts,tsx}'] : [...preset.files];

	/** @type {import('eslint').Linter.Config[]} */
	const layers = [
		{ plugins: { 'baseline-js': plugin } },
		{
			files: files_glob,
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
