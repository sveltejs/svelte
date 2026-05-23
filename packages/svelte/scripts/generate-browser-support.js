// Regenerates `documentation/docs/07-misc/05-browser-support.md`.
//
// Pipeline:
//   1. Bundle each runtime entry point with rollup using the same export
//      conditions as a production bundler. Write each bundle to
//      `scripts/_baseline/<entry>.ts` alongside a minimal tsconfig so the
//      linter has type information — without it the Baseline rule misses
//      instance methods like `String.prototype.replaceAll`.
//   2. Run ESLint with `eslint-plugin-baseline-js`'s `recommended-ts`
//      preset, ratcheting the Baseline year up from 2015 until the lint
//      passes. That year is the runtime floor.
//   3. Also scan the compiler-emitted snapshot fixtures under
//      `tests/snapshot/samples/*/_expected/client/*.js`.
//   4. Verify each entry in `IGNORE_FEATURES` is still flagged by the
//      scanner — if not, it can be removed.
//   5. Enumerate every user-facing feature (every `bind:*` from the
//      compiler's `binding_properties`, every export of every tested
//      subpackage, the `$state.snapshot` rune, directives like
//      `transition:`/`animate:`/`use:`/`{@html}`/custom elements).
//      For each: generate a minimal fixture, compile, bundle, scan.
//      If the bundle's floor exceeds the runtime floor, emit a row in
//      the conditional-features table. Blind-spot detectors fill in for
//      APIs the type-aware scanner can't see (string-literal options
//      like `device-pixel-content-box`, instance `.zoom` reads, etc.).
//   6. Translate floors into concrete browser versions via
//      `baseline-browser-mapping` and rewrite both tables.
//
// Required dev dependencies:
//   - eslint, eslint-plugin-baseline-js, @typescript-eslint/parser
//   - baseline-browser-mapping

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { ESLint } from 'eslint';
import { getCompatibleVersions } from 'baseline-browser-mapping';
import {
	config as eslint_config,
	IGNORE_FEATURES,
	FALSE_POSITIVE_FEATURES
} from './browser-support.eslint.config.js';
import { binding_properties } from '../src/compiler/phases/bindings.js';
import { compile as svelte_compile } from '../src/compiler/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg_dir = path.resolve(__dirname, '..');
const repo_root = path.resolve(pkg_dir, '..', '..');
const docs_page = path.join(repo_root, 'documentation/docs/07-misc/05-browser-support.md');
const snapshot_dir = path.join(pkg_dir, 'tests/snapshot/samples');
const tmp_dir = path.join(__dirname, '_baseline');

const pkg = JSON.parse(fs.readFileSync(path.join(pkg_dir, 'package.json'), 'utf-8'));

/**
 * Subpackage exports we test individually. Each one produces a per-feature
 * fixture: `import { X } from 'svelte/Y'` plus a usage that prevents
 * tree-shaking. If the fixture bundles to code that exceeds the runtime
 * floor, an entry is auto-generated in the conditional features table.
 *
 * Limited to publicly-imported APIs that have their own subpath. `svelte`
 * itself, `svelte/store`, `svelte/events`, `svelte/easing`, and
 * `svelte/attachments` are either covered by the aggregate scan or are
 * pure math — they would produce noise.
 */
const TESTED_SUBPACKAGE_EXPORTS = {
	'svelte/animate': ['flip'],
	'svelte/transition': ['blur', 'fade', 'fly', 'slide', 'scale', 'draw', 'crossfade'],
	'svelte/motion': ['Spring', 'Tween', 'spring', 'tweened', 'prefersReducedMotion'],
	'svelte/reactivity': [
		'SvelteDate',
		'SvelteSet',
		'SvelteMap',
		'SvelteURL',
		'SvelteURLSearchParams',
		'MediaQuery',
		'createSubscriber'
	],
	'svelte/reactivity/window': [
		'scrollX',
		'scrollY',
		'innerWidth',
		'innerHeight',
		'outerWidth',
		'outerHeight',
		'screenLeft',
		'screenTop',
		'online',
		'devicePixelRatio'
	]
};

/**
 * Runes whose runtime path is meaningfully different from the always-on
 * reactivity machinery and worth testing in isolation. Most runes
 * (`$state`, `$derived`, etc.) are already covered by the aggregate scan.
 * `$state.snapshot()` is the standout — it pulls in `clone.js` which uses
 * `structuredClone`.
 *
 * @type {Array<{ name: string, source: string }>}
 */
const TESTED_RUNES = [
	{
		name: '`$state.snapshot()`',
		source: `<script>const value = $state({});const snap = $state.snapshot(value);console.log(snap);</script>`
	}
];

/**
 * Compiled-fixture sources for directives. Bindings are covered by the
 * `binding_properties` enumeration; transitions, animate, actions, and
 * `@attach` need explicit fixtures because they require accompanying
 * imports or surrounding markup.
 */
const TESTED_DIRECTIVES = [
	{
		name: '`transition:` / `in:` / `out:`',
		source: `<script>import { fade } from 'svelte/transition'; let show = $state(false);</script>{#if show}<div transition:fade></div>{/if}`
	},
	{
		name: '`animate:`',
		source: `<script>import { flip } from 'svelte/animate'; let items = $state([1,2,3]);</script>{#each items as item (item)}<div animate:flip>{item}</div>{/each}`
	},
	{
		name: '`use:` actions',
		source: `<script>function action(node){return {destroy(){}}}</script><div use:action></div>`
	},
	{
		name: '`@attach`',
		source: `<script>const attachment = (node) => () => {};</script><div {@attach attachment}></div>`
	},
	{
		name: '`{@html ...}`',
		source: `<script>let html = $state('<b>x</b>');</script>{@html html}`
	},
	{
		name: 'Custom elements (`<svelte:options customElement>`)',
		source: `<svelte:options customElement="my-el" />\n<div></div>`
	}
];

/**
 * Blind-spot detectors: APIs the type-aware scanner cannot see because
 * they're accessed via string-literal options, dynamic property reads,
 * or with type information stripped by bundling. Each detector runs a
 * regex over the bundled fixture and, if it matches, bumps the
 * fixture's floor to the declared baseline year.
 *
 * Each entry MUST be justified — the comment is the only documentation
 * a reviewer has to evaluate why an entry belongs here.
 *
 * @type {Array<{
 *   regex: RegExp,
 *   name: string,
 *   baseline_year: number,
 *   versions: Record<string, string>
 * }>}
 */
const BLIND_SPOT_DETECTORS = [
	{
		// `box: 'device-pixel-content-box'` in `bind_resize_observer` (size.js).
		// The string literal is referenced unconditionally inside a module-level
		// `/* @__PURE__ */ new ResizeObserverSingleton({...})`; once any of the
		// size bindings is used, the bundler keeps all three observer
		// instantiations because they share a function body, and the
		// `device-pixel-content-box` constructor runs at module load. The
		// scanner cannot see the string. Per MDN:
		// Chrome 84 (Jul 2020), Firefox 93 (Oct 2021), Safari 16.4 (Mar 2023).
		regex: /['"]device-pixel-content-box['"]/,
		name: '`ResizeObserver` `box: device-pixel-content-box` option',
		baseline_year: 2023,
		versions: { chrome: '84', edge: '84', firefox: '93', safari: '16.4' }
	},
	{
		// `getComputedStyle(current).zoom` walk in `svelte/animate`'s `flip`
		// fallback path. Firefox didn't expose `.zoom` until v126 (May 2024);
		// pre-126 the read yields `""` → `NaN`, breaking the animation math.
		// Scanner cannot see the `.zoom` instance property access.
		regex: /getComputedStyle\([^)]*\)\.zoom\b/,
		name: 'CSS `zoom` property reads (`getComputedStyle(...).zoom`)',
		baseline_year: 2025,
		versions: { firefox: '126' }
	}
	// Note: `controller.abort(STALE_REACTION)` in `runtime.js` was previously
	// detected here, but the call is in the always-on reactivity teardown
	// and gets bundled with every fixture. Detection would fire for every
	// feature, drowning the table in noise — and the API degrades
	// gracefully (older browsers still abort; only `signal.reason` differs).
	// Not worth flagging.
];

/**
 * Subpath exports whose browser code ships to end users. Derived by walking
 * `pkg.exports` and keeping every entry that resolves to a `.js` file under
 * the `browser` or `default` condition (i.e. anything that can end up in a
 * client-side bundle). Server-only entries (`./server`, `./internal/server`,
 * `./compiler`), type-only entries (`./action`, `./elements`), and trivial
 * flag/string modules (`./internal/flags/*`, `./internal/disclose-version`)
 * are excluded — they either don't run in the browser or contain no
 * meaningful API surface to scan.
 */
const runtime_entry_points = [
	'svelte',
	'svelte/animate',
	'svelte/attachments',
	'svelte/easing',
	'svelte/events',
	'svelte/internal/client',
	'svelte/legacy',
	'svelte/motion',
	'svelte/reactivity',
	'svelte/reactivity/window',
	'svelte/store',
	'svelte/transition'
];

/**
 * Filesystem-safe identifier for an importee like `svelte/internal/client`.
 *
 * @param {string} importee
 */
function safe_name(importee) {
	return importee.replace(/[^a-z0-9]+/gi, '_');
}

/**
 * Set up `scripts/_baseline/` with a tsconfig that covers the bundle files
 * we are about to write. The directory is wiped on each run so stale
 * bundles cannot leak into the next scan.
 */
function prepare_tmp_dir() {
	fs.rmSync(tmp_dir, { recursive: true, force: true });
	fs.mkdirSync(tmp_dir, { recursive: true });

	const tsconfig = {
		compilerOptions: {
			target: 'esnext',
			module: 'esnext',
			moduleResolution: 'bundler',
			lib: ['esnext', 'dom', 'dom.iterable'],
			allowJs: true,
			checkJs: false,
			strict: false,
			noEmit: true,
			skipLibCheck: true,
			isolatedModules: true
		},
		include: ['./*.ts']
	};
	fs.writeFileSync(path.join(tmp_dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

	return path.join(tmp_dir, 'tsconfig.json');
}

/**
 * Bundle a runtime entry the way users receive it, so we scan the same code
 * the browser does. Mirrors the approach in `check-treeshakeability.js`.
 *
 * @param {string} importee
 */
async function bundle_runtime(importee) {
	const bundle = await rollup({
		input: '__entry__',
		plugins: [
			virtual({ __entry__: `export * from '${importee}';` }),
			{
				name: 'resolve-svelte',
				resolveId(id) {
					if (id.startsWith('svelte')) {
						const entry = pkg.exports[id.replace('svelte', '.')];
						if (!entry) return;
						return path.resolve(pkg_dir, entry.browser ?? entry.default);
					}
				}
			},
			nodeResolve({
				exportConditions: ['production', 'import', 'browser', 'default']
			})
		],
		// Treat optional peers / Node-only branches as external so we only scan
		// code that actually runs in the browser.
		external: ['esm-env']
	});

	const { output } = await bundle.generate({ format: 'esm' });
	await bundle.close();

	return output
		.filter((chunk) => chunk.type === 'chunk')
		.map((chunk) => /** @type {import('rollup').OutputChunk} */ (chunk).code)
		.join('\n');
}

/**
 * Read every compiler-emitted client file from the snapshot tests. These
 * fixtures cover the full range of patterns the compiler emits — bindings,
 * transitions, `<svelte:element>`, async derived, hydration markers, etc.
 *
 * @returns {Array<{ filename: string, code: string }>}
 */
function load_compiler_output_fixtures() {
	/** @type {Array<{ filename: string, code: string }>} */
	const fixtures = [];

	for (const sample of fs.readdirSync(snapshot_dir)) {
		const client_dir = path.join(snapshot_dir, sample, '_expected/client');
		if (!fs.existsSync(client_dir)) continue;

		for (const file of fs.readdirSync(client_dir)) {
			if (!file.endsWith('.js')) continue;
			fixtures.push({
				filename: `${sample}/${file}`,
				code: fs.readFileSync(path.join(client_dir, file), 'utf-8')
			});
		}
	}

	return fixtures;
}

/**
 * Year identifiers we sweep, from oldest to newest. The Baseline rule reports
 * a feature when its Baseline year is *greater* than the configured target,
 * so the first year here that produces zero errors is the smallest Baseline
 * year that contains every feature Svelte uses — i.e. the actual minimum
 * required floor. Targets newer than that floor also pass, but they would
 * overstate the requirement (and produce browser versions that are newer
 * than what the code actually needs).
 *
 * `'newly'` is the final fallback for features that have just reached
 * Baseline and aren't yet attributable to a year. We do not include
 * `'widely'` in the search: passing `'widely'` only tells us the code is
 * conservative enough for the moving 30-month window, not what the
 * technical floor is.
 *
 * @type {Array<number | 'newly'>}
 */
const targets = (() => {
	const this_year = new Date().getFullYear();
	const years = [];
	for (let y = 2015; y <= this_year; y++) years.push(y);
	return [...years, 'newly'];
})();

/**
 * Lint the on-disk bundle files (runtime entries) with type-aware mode.
 *
 * @param {string[]} files Absolute paths inside `tmp_dir`.
 * @param {string} tsconfig Absolute path to the tsconfig in `tmp_dir`.
 * @param {number | 'newly'} target
 */
async function lint_runtime_files(files, tsconfig, target) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslint_config(target, { tsconfig, root: tmp_dir })
	});
	return eslint.lintFiles(files);
}

/**
 * Lint a compiler-output fixture in syntax-only mode (no type info — the
 * fixtures are tiny snippets without a tsconfig). The patterns the
 * compiler emits are bounded, so the non-typed scan is sufficient.
 *
 * @param {string} label
 * @param {string} source
 * @param {number | 'newly'} target
 */
async function lint_fixture(label, source, target) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslint_config(target)
	});
	const [result] = await eslint.lintText(source, { filePath: `${label}.js` });
	return result;
}

/**
 * The lint target immediately preceding `target` in the search order, used
 * to surface the features that drove the floor. Returns `undefined` for
 * the first target.
 *
 * @param {number | 'newly'} target
 * @returns {number | 'newly' | undefined}
 */
function prev_target(target) {
	const i = targets.indexOf(target);
	return i > 0 ? targets[i - 1] : undefined;
}

/**
 * @param {string[]} runtime_files Absolute paths to bundle files in `tmp_dir`.
 * @param {string} tsconfig Absolute path to the tsconfig in `tmp_dir`.
 * @param {Array<{ filename: string, code: string }>} compiler_fixtures
 */
async function find_minimum_target(runtime_files, tsconfig, compiler_fixtures) {
	/** @type {Map<string, Set<string>>} target → set of feature messages that tripped it */
	const failures_by_target = new Map();

	for (const target of targets) {
		const failures = new Set();

		// Type-aware scan over the runtime bundles.
		const runtime_results = await lint_runtime_files(runtime_files, tsconfig, target);
		for (const result of runtime_results) {
			const label = `runtime/${path.basename(result.filePath, '.ts')}`;
			for (const m of result.messages) {
				if (m.ruleId === 'baseline-js/use-baseline') {
					failures.add(`${label}: ${m.message}`);
				}
			}
		}

		// Syntax-only scan over the compiler-output fixtures.
		for (const fixture of compiler_fixtures) {
			const label = `compiler-output/${fixture.filename}`;
			const result = await lint_fixture(label, fixture.code, target);
			for (const m of result.messages) {
				if (m.ruleId === 'baseline-js/use-baseline') {
					failures.add(`${label}: ${m.message}`);
				}
			}
		}

		if (failures.size === 0) {
			const previous = failures_by_target.get(String(prev_target(target)));
			if (previous && previous.size > 0) {
				// eslint-disable-next-line no-console
				console.log(`  → ${target} (features that drove the floor:)`);
				const unique = new Set();
				for (const f of previous) {
					// e.g. "runtime: Feature 'Nullish coalescing' (nullish-coalescing) became Baseline in 2020 and exceeds 2019."
					const m = /Feature '([^']+)' \(([^)]+)\)/.exec(f);
					if (m) unique.add(`${m[1]} (${m[2]})`);
				}
				// eslint-disable-next-line no-console
				for (const f of [...unique].sort()) console.log(`    - ${f}`);
			}
			return target;
		}
		failures_by_target.set(String(target), failures);
		// eslint-disable-next-line no-console
		console.log(`  ${target}: ${failures.size} feature(s) exceed budget`);
		if (process.env.DEBUG_BROWSER_SUPPORT) {
			const unique = new Set();
			for (const f of failures) {
				const m = /Feature '([^']+)' \(([^)]+)\)/.exec(f);
				if (m) unique.add(`${m[1]} (${m[2]})`);
			}
			// eslint-disable-next-line no-console
			for (const f of [...unique].sort()) console.log(`    - ${f}`);
		}
	}

	const newly_failures = failures_by_target.get('newly');
	const sample = newly_failures
		? [...newly_failures].slice(0, 10).join('\n  - ')
		: '(no failures recorded)';
	throw new Error(
		'No Baseline target in the search range covered Svelte. ' +
			'A brand-new API may be in use that has not yet reached Baseline Newly available.\n' +
			`First failures at the most permissive target (\`newly\`):\n  - ${sample}`
	);
}

/**
 * Apply the manual overrides in `KNOWN_API_FLOORS`, bumping `target` to
 * Extract every unique web-feature ID flagged in a lint result.
 *
 * @param {import('eslint').ESLint.LintResult} result
 */
function feature_ids_in(result) {
	const ids = new Set();
	for (const m of result.messages) {
		if (m.ruleId !== 'baseline-js/use-baseline') continue;
		const match = /\(([^)]+)\)/.exec(m.message);
		if (match) ids.add(match[1]);
	}
	return ids;
}

/**
 * Extract friendly feature names ("structuredClone()", "Resize observer")
 * from the lint output for use in user-facing tables.
 *
 * @param {import('eslint').ESLint.LintResult} result
 */
function feature_names_in(result) {
	const names = new Set();
	for (const m of result.messages) {
		if (m.ruleId !== 'baseline-js/use-baseline') continue;
		// Messages look like: Feature 'Resize observer' (resize-observer) became Baseline in 2020…
		const match = /Feature '([^']+)'/.exec(m.message);
		if (match) names.add(`\`${match[1]}\``);
	}
	return names;
}

/**
 * Verify every entry in `IGNORE_FEATURES` is actually used by the runtime.
 * Without this, a suppression can outlive the API it suppresses — the
 * comment stays in the config file pointing at code that no longer exists.
 *
 * Runs the type-aware aggregate scan with only the genuine false-positive
 * suppression in place. Any IGNORE_FEATURES entry whose feature ID does
 * NOT appear in the resulting flagged set is reported as removable.
 *
 * @param {string[]} runtime_files
 * @param {string} tsconfig
 */
async function validate_ignore_features(runtime_files, tsconfig) {
	const false_positives = new Set(FALSE_POSITIVE_FEATURES);
	const to_check = IGNORE_FEATURES.filter((id) => !false_positives.has(id));
	if (to_check.length === 0) return;

	// Scan at year 2015 so the rule reports every Baseline-classified
	// feature regardless of year — the goal is "is this feature ever
	// flagged?", not "is it newer than X".
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslint_config(2015, { tsconfig, root: tmp_dir }, { purpose: 'per-file' })
	});
	const results = await eslint.lintFiles(runtime_files);

	const flagged = new Set();
	for (const result of results) {
		for (const id of feature_ids_in(result)) flagged.add(id);
	}

	const stale = to_check.filter((id) => !flagged.has(id));
	if (stale.length > 0) {
		throw new Error(
			`IGNORE_FEATURES contains entries that the scanner does not flag — ` +
				`they can be removed:\n` +
				stale.map((id) => `  - ${id}`).join('\n') +
				`\n\nEdit \`packages/svelte/scripts/browser-support.eslint.config.js\` ` +
				`and delete the stale entries. If the API was removed from the runtime ` +
				`as part of this change, that is exactly the intended signal.`
		);
	}
}

/**
 * Build the full list of user-facing features to test for conditional
 * floor bumps. Each feature gets a self-contained fixture, compiled and
 * bundled like real user code, then scanned. If the bundle's floor
 * exceeds the runtime floor, a row is auto-emitted in the docs.
 *
 * @returns {Array<{ name: string, source: string, kind: 'svelte' | 'js' }>}
 */
function enumerate_features() {
	/** @type {Array<{ name: string, source: string, kind: 'svelte' | 'js' }>} */
	const features = [];

	// Every `bind:*` accepted by the compiler. Element selection respects
	// the `valid_elements` constraint declared in `binding_properties`.
	for (const [name, props] of Object.entries(binding_properties)) {
		const fixture = binding_fixture(name, props);
		if (fixture) {
			features.push({
				name: `\`bind:${name}\``,
				kind: 'svelte',
				source: fixture
			});
		}
	}

	for (const [module, exports] of Object.entries(TESTED_SUBPACKAGE_EXPORTS)) {
		for (const exp of exports) {
			features.push({
				name: `\`{ ${exp} }\` from \`${module}\``,
				kind: 'js',
				source: `import { ${exp} } from '${module}'; export const _ = ${exp};`
			});
		}
	}

	for (const rune of TESTED_RUNES) {
		features.push({ name: rune.name, kind: 'svelte', source: rune.source });
	}

	for (const directive of TESTED_DIRECTIVES) {
		features.push({ name: directive.name, kind: 'svelte', source: directive.source });
	}

	return features;
}

/**
 * Produce the `.svelte` source for a single binding fixture. Returns
 * `null` for bindings the compiler treats as elements rather than
 * properties (none currently, but defensive).
 *
 * @param {string} name
 * @param {import('../src/compiler/phases/bindings.js').BindingProperty} props
 */
function binding_fixture(name, props) {
	// Map declared `valid_elements` to a concrete element + minimal attrs
	// so the compiler accepts the binding.
	const tag = (props.valid_elements ?? ['div'])[0];

	// Pick a sensible initial value and attribute set per binding.
	const reactive = `let v = $state();`;

	if (tag === 'svelte:window') {
		return `<script>${reactive}</script><svelte:window bind:${name}={v} />`;
	}
	if (tag === 'svelte:document') {
		return `<script>${reactive}</script><svelte:document bind:${name}={v} />`;
	}
	if (tag === 'input') {
		// `bind:checked` requires type="checkbox"|"radio"; `bind:group` too.
		const type =
			name === 'checked' || name === 'indeterminate'
				? ' type="checkbox"'
				: name === 'group'
					? ' type="radio" value="a"'
					: name === 'files'
						? ' type="file"'
						: '';
		return `<script>${reactive}</script><input${type} bind:${name}={v} />`;
	}
	if (tag === 'details') {
		return `<script>${reactive}</script><details bind:${name}={v}><summary>x</summary></details>`;
	}

	return `<script>${reactive}</script><${tag} bind:${name}={v}></${tag}>`;
}

/**
 * Compile a `.svelte` fixture to JS (no-op for `.js` fixtures), then
 * bundle the result with rollup using the same export conditions as
 * `bundle_runtime`. Returns the bundled code as a single string.
 *
 * @param {{ name: string, source: string, kind: 'svelte' | 'js' }} feature
 */
async function bundle_fixture(feature) {
	let entry_code = feature.source;
	if (feature.kind === 'svelte') {
		const compiled = svelte_compile(feature.source, {
			generate: 'client',
			filename: 'Fixture.svelte',
			dev: false
		});
		entry_code = compiled.js.code;
	}

	const bundle = await rollup({
		input: '__fixture__',
		plugins: [
			virtual({ __fixture__: entry_code }),
			{
				name: 'resolve-svelte',
				resolveId(id) {
					if (id.startsWith('svelte')) {
						const entry = pkg.exports[id.replace('svelte', '.')];
						if (!entry) return;
						return path.resolve(pkg_dir, entry.browser ?? entry.default);
					}
				}
			},
			nodeResolve({ exportConditions: ['production', 'import', 'browser', 'default'] })
		],
		external: ['esm-env'],
		// Fixtures are tiny; suppress rollup's warnings about circular deps
		// in the Svelte runtime which we already accept in `bundle_runtime`.
		onwarn() {}
	});

	const { output } = await bundle.generate({ format: 'esm' });
	await bundle.close();

	return output
		.filter((chunk) => chunk.type === 'chunk')
		.map((chunk) => /** @type {import('rollup').OutputChunk} */ (chunk).code)
		.join('\n');
}

/**
 * Apply blind-spot detectors to a bundled fixture. Returns the highest
 * baseline year demanded by any matching detector, along with version
 * data and the list of detector names that matched.
 *
 * @param {string} bundle_code
 */
function apply_blind_spots(bundle_code) {
	let year = 0;
	/** @type {Record<string, string>} */
	let versions = {};
	const matched = [];

	for (const detector of BLIND_SPOT_DETECTORS) {
		if (!detector.regex.test(bundle_code)) continue;
		matched.push(detector.name);
		if (detector.baseline_year > year) {
			year = detector.baseline_year;
			versions = detector.versions;
		}
	}

	return { year, versions, matched };
}

/**
 * Compute the minimum Baseline year a fixture's bundle requires. Reuses
 * the same year-search as the aggregate scan but on a single per-fixture
 * file, with the per-file ignore list (no behavioural suppressions).
 *
 * @param {string} fixture_file Absolute path to the `.ts` bundle.
 */
async function scan_fixture_floor(fixture_file) {
	let last_failure_names = new Set();
	for (const year of targets) {
		const eslint = new ESLint({
			overrideConfigFile: true,
			overrideConfig: eslint_config(
				year,
				{ tsconfig: path.join(tmp_dir, 'tsconfig.json'), root: tmp_dir },
				{ purpose: 'per-fixture' }
			)
		});
		const [result] = await eslint.lintFiles([fixture_file]);
		if (result.errorCount === 0) {
			// Drivers are the features that just stopped failing — names
			// captured from the previous (one-year-stricter) scan.
			return { year, driving: [...last_failure_names] };
		}
		last_failure_names = feature_names_in(result);
	}
	return { year: /** @type {const} */ ('newly'), driving: [...last_failure_names] };
}

/**
 * Iterate every feature, bundle its fixture, scan it. Return the rows
 * that need to appear in the conditional-features table.
 *
 * @param {number | 'newly'} runtime_floor
 * @returns {Promise<Array<{
 *   name: string,
 *   api: string,
 *   versions: Record<string, string>,
 *   baseline_year: number | 'newly'
 * }>>}
 */
async function find_all_conditional_features(runtime_floor) {
	const runtime_year = typeof runtime_floor === 'number' ? runtime_floor : Infinity;
	const features = enumerate_features();
	/** @type {Array<{
	 *   name: string,
	 *   api: string,
	 *   versions: Record<string, string>,
	 *   baseline_year: number | 'newly'
	 * }>} */
	const rows = [];

	for (let i = 0; i < features.length; i++) {
		const feature = features[i];
		// eslint-disable-next-line no-console
		process.stdout.write(`\r  ${i + 1}/${features.length}  ${feature.name}`.padEnd(80));

		let bundle_code;
		try {
			bundle_code = await bundle_fixture(feature);
		} catch {
			continue; // some fixtures (rare element combos) may fail to compile
		}

		// Write the bundle so the type-aware scanner can resolve its types.
		const fixture_file = path.join(tmp_dir, `fixture_${i}.ts`);
		fs.writeFileSync(fixture_file, bundle_code);

		const scanned = await scan_fixture_floor(fixture_file);
		const blind = apply_blind_spots(bundle_code);

		const scanner_year = scanned.year === 'newly' ? Infinity : scanned.year;
		const final_year = Math.max(scanner_year, blind.year);

		// Skip features at or below the runtime floor — they don't need a row.
		if (final_year <= runtime_year || final_year === 0) continue;

		// Prefer blind-spot version data when it's the strictest constraint.
		// When the scanner detects a higher floor than any blind spot, look up
		// the browser versions for that year — but `baseline-browser-mapping`
		// rejects future targets (years that have not ended yet), so we skip
		// rows that depend on years we can't resolve.
		let versions;
		let api;
		if (blind.matched.length > 0 && blind.year >= scanner_year) {
			versions = blind.versions;
			api = blind.matched.join(', ');
		} else if (typeof final_year === 'number' && Number.isFinite(final_year)) {
			try {
				versions = browser_versions_for(final_year);
			} catch {
				continue;
			}
			api = scanned.driving.join(', ') || '(see bundle output)';
		} else {
			// Scanner says 'newly' AND no blind spot matched — we know the
			// fixture uses something past every recorded Baseline year, but
			// can't pin down browser versions. Skip rather than mislead.
			continue;
		}

		rows.push({
			name: feature.name,
			api,
			versions,
			baseline_year: Number.isFinite(final_year) ? /** @type {number} */ (final_year) : 'newly'
		});
	}
	// eslint-disable-next-line no-console
	process.stdout.write('\n');

	return rows;
}

/**
 * Render the per-feature browser-requirements table from the auto-detected
 * rows. Sorted by Safari floor descending, then alphabetically.
 *
 * @param {Array<{
 *   name: string,
 *   api: string,
 *   versions: Record<string, string>,
 *   baseline_year: number | 'newly'
 * }>} rows
 * @param {number | 'newly'} runtime_floor
 */
function render_conditional_table(rows, runtime_floor) {
	if (rows.length === 0) {
		return '_No features currently require browser versions newer than the runtime floor._';
	}

	const browsers = /** @type {const} */ ([
		['chrome', 'Chrome / Edge'],
		['firefox', 'Firefox'],
		['safari', 'Safari']
	]);

	const runtime_versions = browser_versions_for(runtime_floor);

	const sorted = [...rows].sort((a, b) => {
		const sa = Number(a.versions.safari ?? '0');
		const sb = Number(b.versions.safari ?? '0');
		if (sb !== sa) return sb - sa;
		return a.name.localeCompare(b.name);
	});

	const header =
		'| Feature | Affected API | ' + browsers.map(([, label]) => `Min ${label}`).join(' | ') + ' |';
	const sep = '| --- | --- |' + browsers.map(() => ' ---: |').join('');

	const body = sorted.map((entry) => {
		const cells = browsers.map(([key]) => {
			const v = entry.versions[key];
			if (!v) return '(floor)';
			const floor_v = runtime_versions[key];
			return floor_v && Number(v) <= Number(floor_v) ? '(floor)' : v;
		});
		return `| ${entry.name} | ${entry.api} | ${cells.join(' | ')} |`;
	});

	return [header, sep, ...body].join('\n');
}

/**
 * @param {number | 'newly'} target
 */
function browser_versions_for(target) {
	// `targetYear` returns the minimum versions in which every feature that
	// reached Baseline by the end of that year is supported. If the lint
	// search fell through to `'newly'`, we use the current year — that gives
	// the most recent Newly-available cutoff, which is the strongest
	// statement `baseline-browser-mapping` is able to make.
	const target_year = typeof target === 'number' ? target : new Date().getFullYear();

	const versions = getCompatibleVersions({
		targetYear: target_year,
		includeDownstreamBrowsers: true
	});

	// The core Baseline browsers plus the downstream browsers worth listing
	// in the docs. Downstream browsers come from `baseline-browser-mapping`'s
	// dataset and represent the highest-traffic Chromium derivatives; the
	// long tail (UC, QQ, Yandex, in-app Facebook/Instagram browsers, etc.)
	// is omitted to keep the table focused.
	const visible_browsers = new Set([
		'chrome',
		'chrome_android',
		'edge',
		'firefox',
		'firefox_android',
		'safari',
		'safari_ios',
		'opera',
		'opera_android',
		'samsunginternet_android',
		'webview_android'
	]);

	/** @type {Record<string, string>} */
	const lookup = {};
	for (const { browser, version } of versions) {
		if (visible_browsers.has(browser)) lookup[browser] = version;
	}
	return lookup;
}

/**
 * @param {Record<string, string>} versions
 * @param {number | 'newly'} target
 */
function render_table(versions, target) {
	// Chrome and Edge ship from the same engine and historically resolve to the
	// same Baseline version. Collapse them into one row when they match, but
	// fall back to listing them separately if they ever drift.
	const chrome_edge =
		versions.chrome && versions.chrome === versions.edge
			? ['Chrome / Edge', versions.chrome]
			: null;

	const base_rows = chrome_edge
		? [chrome_edge, ['Chrome (Android)', versions.chrome_android ?? '?']]
		: [
				['Chrome', versions.chrome ?? '?'],
				['Chrome (Android)', versions.chrome_android ?? '?'],
				['Edge', versions.edge ?? '?']
			];

	const rows = [
		...base_rows,
		['Firefox', versions.firefox ?? '?'],
		['Firefox (Android)', versions.firefox_android ?? '?'],
		['Safari', versions.safari ?? '?'],
		['Safari (iOS)', versions.safari_ios ?? '?'],
		['Opera', versions.opera ?? '?'],
		['Opera (Android)', versions.opera_android ?? '?'],
		['Samsung Internet', versions.samsunginternet_android ?? '?'],
		['Android WebView', versions.webview_android ?? '?']
	];

	const target_label = target === 'newly' ? 'Baseline Newly available' : `Baseline ${target}`;

	const width_a = Math.max(...rows.map((r) => r[0].length), 'Browser'.length);
	const width_b = Math.max(...rows.map((r) => String(r[1]).length), 'Minimum version'.length);

	const pad = (/** @type {string} */ s, /** @type {number} */ n) =>
		s + ' '.repeat(Math.max(0, n - s.length));

	const header = `| ${pad('Browser', width_a)} | ${pad('Minimum version', width_b)} |`;
	const sep = `| ${'-'.repeat(width_a)} | ${'-'.repeat(width_b)} |`;
	const body = rows
		.map(([a, b]) => `| ${pad(a, width_a)} | ${pad(String(b), width_b)} |`)
		.join('\n');

	return `_Resolved Baseline target: **${target_label}**._\n\n${header}\n${sep}\n${body}`;
}

/**
 * Replace the markdown between `<!-- ${name}:start -->` and `<!-- ${name}:end -->`.
 *
 * @param {string} source
 * @param {string} name
 * @param {string} replacement
 */
function replace_block(source, name, replacement) {
	const start = `<!-- ${name}:start -->`;
	const end = `<!-- ${name}:end -->`;
	const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);

	if (!pattern.test(source)) {
		throw new Error(`Could not find \`${start}\` / \`${end}\` markers in ${docs_page}.`);
	}

	return source.replace(pattern, `${start}\n\n${replacement}\n\n${end}`);
}

/**
 * Render the runtime-entries list as inline markdown: e.g.
 * `` `svelte`, `svelte/animate`, `svelte/easing` and `svelte/transition` ``.
 * Used in the "What is covered" prose so the docs cannot drift from
 * `runtime_entry_points` in this script.
 */
function render_runtime_entries() {
	const quoted = runtime_entry_points.map((e) => `\`${e}\``);
	if (quoted.length <= 1) return quoted.join('');
	const last = quoted.pop();
	return `${quoted.join(', ')} and ${last}`;
}

/**
 * @param {string} headline_table
 * @param {string} conditional_table
 * @param {string} runtime_entries
 */
function rewrite_docs_page(headline_table, conditional_table, runtime_entries) {
	let source = fs.readFileSync(docs_page, 'utf-8');
	source = replace_block(source, 'generated-table', headline_table);
	source = replace_block(source, 'conditional-features', conditional_table);
	source = replace_inline_block(source, 'runtime-entries', runtime_entries);
	fs.writeFileSync(docs_page, source);
}

/**
 * Like `replace_block` but used for inline markers on a single line —
 * no surrounding blank lines added.
 *
 * @param {string} source
 * @param {string} name
 * @param {string} replacement
 */
function replace_inline_block(source, name, replacement) {
	const start = `<!-- ${name}:start -->`;
	const end = `<!-- ${name}:end -->`;
	const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);

	if (!pattern.test(source)) {
		throw new Error(`Could not find \`${start}\` / \`${end}\` markers in ${docs_page}.`);
	}

	return source.replace(pattern, `${start}${replacement}${end}`);
}

/* eslint-disable no-console */
async function main() {
	console.log('Preparing scratch directory…');
	const tsconfig = prepare_tmp_dir();

	console.log('Bundling runtime entries…');
	const runtime_files = [];
	for (const importee of runtime_entry_points) {
		const code = await bundle_runtime(importee);
		const file = path.join(tmp_dir, `${safe_name(importee)}.ts`);
		fs.writeFileSync(file, code);
		runtime_files.push(file);
	}

	console.log('Loading compiler-output fixtures…');
	const compiler_fixtures = load_compiler_output_fixtures();
	console.log(`  (${compiler_fixtures.length} fixtures found)`);

	console.log('Searching for the minimum Baseline target (type-aware)…');
	const target = await find_minimum_target(runtime_files, tsconfig, compiler_fixtures);
	console.log(`  → ${target}`);

	console.log('Checking IGNORE_FEATURES for stale entries…');
	await validate_ignore_features(runtime_files, tsconfig);
	console.log('  no stale entries');

	console.log('Scanning per-feature fixtures for conditional requirements…');
	const conditional_rows = await find_all_conditional_features(target);
	console.log(
		`  ${conditional_rows.length} feature(s) require browsers newer than the runtime floor`
	);

	console.log('Resolving browser versions…');
	const versions = browser_versions_for(target);

	console.log('Rewriting docs page…');
	rewrite_docs_page(
		render_table(versions, target),
		render_conditional_table(conditional_rows, target),
		render_runtime_entries()
	);

	console.log('Cleaning up scratch directory…');
	fs.rmSync(tmp_dir, { recursive: true, force: true });

	console.log('Done.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
