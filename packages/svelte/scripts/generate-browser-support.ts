/* eslint-disable no-console */
// Regenerates `documentation/docs/07-misc/05-browser-support.md`.
//
// Pipeline:
//   1. Bundle each runtime entry point with rollup using production export
//      conditions, then walk the resulting JS with TypeScript's compiler
//      API + TypeChecker. The walker (see `browser-support.detector.js`)
//      flags any web-features ID the runtime references.
//   2. Verify each entry in `BEHAVIORAL_IGNORE` is still flagged by the
//      detector — if not, the entry can be removed.
//   3. Enumerate every user-facing feature (each `bind:*`, every public
//      subpackage export, every rune from the compiler's `RUNES` array,
//      and the handful of directives that need their own fixtures). For
//      each: compile, bundle, walk. If the bundle requires browser
//      versions newer than the runtime floor, emit a row in the
//      conditional-features table. Blind-spot regexes pick up APIs the
//      AST walker can't see (string-literal constructor options,
//      `getComputedStyle(...).zoom` reads).
//   4. Translate floors into concrete browser versions via `web-features`
//      data (exact per-feature versions), falling back to
//      `baseline-browser-mapping` for year-only resolution.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { rollup, type OutputChunk } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { getCompatibleVersions } from 'baseline-browser-mapping';
import {
	detect_features,
	detect_features_in_text,
	versions_for_feature,
	baseline_year_for_feature,
	register_extra_rules
} from './browser-support.detector.js';
import { binding_properties } from '../src/compiler/phases/bindings.js';
import { RUNES } from '../src/utils.js';
import { compile as svelte_compile } from '../src/compiler/index.js';

type BindingProperty = import('../src/compiler/phases/bindings.js').BindingProperty;
type PackageExport = string | { browser?: string; default?: string };
type CompilerFixture = { filename: string; code: string };
type Feature = { name: string; source: string; kind: 'svelte' | 'js' };
type BrowserVersions = Record<string, string | null>;
type RuntimeFloor = number | 'newly';
type ConditionalRow = {
	name: string;
	doc_link: string | null;
	versions: BrowserVersions;
	baseline_year: RuntimeFloor;
};

const doc_links: Record<string, string | null> = {
	'`$state.snapshot`': '/docs/svelte/$state#$state.snapshot',
	'`bind:devicePixelContentBoxSize`': '/docs/svelte/bind#Dimensions',
	'`flip` from `svelte/animate`': '/docs/svelte/svelte-animate#flip'
};

// Supplemental detection rules for APIs `web-features` doesn't track
// yet. Each rule is checked with full TS type-aware precision — the
// only reason it lives here instead of being auto-derived is that no
// compat key in `web-features` covers the API.
register_extra_rules([
	{
		// `getComputedStyle(current).zoom` walk in `svelte/animate`'s
		// `flip` fallback path. Firefox didn't expose `.zoom` on
		// `CSSStyleDeclaration` until v126 (May 2024) — pre-126 the read
		// yields an empty string, breaking the animation math. No entry
		// for it exists in `web-features` (CSS `zoom` is an IDL accessor
		// without its own Baseline feature record).
		receiver_type: 'CSSStyleDeclaration',
		member: 'zoom',
		feature_id: 'extra:css-zoom-read',
		name: 'CSS zoom property reads (getComputedStyle(...).zoom)',
		baseline_year: 2024,
		versions: { firefox: '126' }
	},
	{
		// `box: 'device-pixel-content-box'` in `bind_resize_observer`
		// (size.js). The TS DOM lib declares the option value as part of
		// the `ResizeObserverBoxOptions` union — we could check the
		// contextual type, but matching the literal value is enough since
		// the string is too specific to occur incidentally. Per MDN BCD:
		//   - constructor option: Chrome 84, Firefox 93, Safari 15.4
		//   - `ResizeObserverEntry.devicePixelContentBoxSize`: Safari NOT
		//     SUPPORTED (`version_added: false`)
		// Safari therefore silently accepts the option from 15.4 onwards
		// but never exposes the matching entry property, so the binding
		// reads `undefined` on any Safari.
		string_literal: 'device-pixel-content-box',
		feature_id: 'extra:device-pixel-content-box',
		name: 'ResizeObserver `box: device-pixel-content-box` option + `entry.devicePixelContentBoxSize`',
		baseline_year: 2023,
		versions: {
			chrome: '84',
			edge: '84',
			firefox: '93',
			safari: null,
			safari_ios: null
		}
	}
]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg_dir = path.resolve(__dirname, '..');
const repo_root = path.resolve(pkg_dir, '..', '..');
const docs_dir = path.join(repo_root, 'documentation/docs/07-misc/.generated');
const snapshot_dir = path.join(pkg_dir, 'tests/snapshot/samples');
const tmp_dir = path.join(__dirname, '_baseline');

const pkg = JSON.parse(fs.readFileSync(path.join(pkg_dir, 'package.json'), 'utf-8')) as {
	exports: Record<string, PackageExport>;
};

/**
 * Suppressions that should NEVER affect the floor regardless of whether
 * the runtime currently uses the API. Two reasons an entry belongs here:
 *
 *   - The `web-features` dataset misclassifies the API (e.g.
 *     `devicepixelratio` is marked Baseline `false` because Safari is
 *     missing from its `support` map, but the property has shipped in
 *     every Safari for over a decade).
 *   - Svelte feature-detects the API at runtime with `?.` and degrades
 *     gracefully when it's unavailable. Example: `trusted-types` in
 *     `src/internal/client/dom/reconciler.js`.
 *
 * These are exempt from the staleness check.
 */
const SAFE_TO_IGNORE = new Set(['devicepixelratio', 'trusted-types']);

/**
 * Suppressions for features that DO live in the runtime but are reached
 * only via a specific code path documented in the per-feature table on
 * the docs page.
 */
const BEHAVIORAL_IGNORE = new Set([
	'structured-clone',
	'extra:css-zoom-read',
	'extra:device-pixel-content-box'
]);

/** Aggregate ignore set — used for the headline floor. */
const AGGREGATE_IGNORE = new Set([...SAFE_TO_IGNORE, ...BEHAVIORAL_IGNORE]);

/**
 * Subpaths in `pkg.exports` whose runtime is Node-only. Can't be derived
 * from the exports map alone — `./compiler` has a `require:` field that
 * hints at CJS, but `./server` and `./internal/server` are plain `default`
 * entries indistinguishable from a browser module.
 */
const NODE_ONLY_EXPORTS = new Set(['./compiler', './server', './internal/server']);

/**
 * Every subpath in `pkg.exports` that ships browser JS. Type-only entries
 * (`./action`, `./elements`) and the `./package.json` re-export filter out
 * naturally on the `.js` check; only Node-only subpaths need an explicit
 * exception, so new browser exports are picked up automatically.
 */
function browser_subpaths(): string[] {
	const subpaths: string[] = [];
	for (const [subpath, conditions] of Object.entries(pkg.exports)) {
		if (NODE_ONLY_EXPORTS.has(subpath)) continue;
		if (typeof conditions !== 'object' || conditions === null) continue;
		const file = conditions.browser ?? conditions.default;
		if (typeof file !== 'string' || !file.endsWith('.js')) continue;
		subpaths.push(subpath);
	}
	return subpaths;
}

/**
 * `.` → `svelte`, `./animate` → `svelte/animate`, etc.
 */
function importee_for(subpath: string): string {
	return subpath === '.' ? 'svelte' : `svelte${subpath.slice(1)}`;
}

/**
 * True if a subpath represents a public, user-facing subpackage whose
 * named exports should each get their own per-feature fixture. Excludes
 * the main entry (covered by the aggregate scan), the `./legacy` shim,
 * and everything under `./internal/`.
 */
function is_public_subpackage(subpath: string): boolean {
	return subpath !== '.' && subpath !== './legacy' && !subpath.startsWith('./internal');
}

/**
 * For each public subpackage, dynamically import the module and return
 * its named exports. Driven entirely by `pkg.exports`, so a new
 * subpackage is picked up the next time the script runs.
 */
async function enumerate_subpackage_exports(): Promise<Record<string, string[]>> {
	const result: Record<string, string[]> = {};
	for (const subpath of browser_subpaths()) {
		if (!is_public_subpackage(subpath)) continue;
		const module_id = importee_for(subpath);
		try {
			const ns = await import(module_id);
			const names = Object.keys(ns)
				.filter((k) => k !== 'default')
				.sort();
			if (names.length > 0) result[module_id] = names;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.warn(`  (could not enumerate ${module_id}: ${message.split('\n')[0]})`);
		}
	}
	return result;
}

const rune_fixtures: Record<(typeof RUNES)[number], string> = {
	$state: `<script>let v = $state(0); console.log(v);</script>`,
	'$state.raw': `<script>let v = $state.raw({}); console.log(v);</script>`,
	'$state.eager': `<script>let v = $state.eager(0); console.log(v);</script>`,
	'$state.snapshot': `<script>const v = $state({}); const snap = $state.snapshot(v); console.log(snap);</script>`,
	$derived: `<script>let a = $state(0); let d = $derived(a + 1); console.log(d);</script>`,
	'$derived.by': `<script>let a = $state(0); let d = $derived.by(() => a + 1); console.log(d);</script>`,
	$props: `<script>let { x } = $props(); console.log(x);</script>`,
	'$props.id': `<script>const id = $props.id(); console.log(id);</script>`,
	$bindable: `<script>let { v = $bindable() } = $props(); console.log(v);</script>`,
	$effect: `<script>$effect(() => { console.log('e'); });</script>`,
	'$effect.pre': `<script>$effect.pre(() => { console.log('p'); });</script>`,
	'$effect.tracking': `<script>$effect(() => { console.log($effect.tracking()); });</script>`,
	'$effect.root': `<script>const stop = $effect.root(() => () => {}); stop();</script>`,
	'$effect.pending': `<script>$effect(() => { console.log($effect.pending()); });</script>`,
	$inspect: `<script>let v = $state(0); $inspect(v);</script>`,
	'$inspect().with': `<script>let v = $state(0); $inspect(v).with(() => {});</script>`,
	'$inspect.trace': `<script>$effect(() => { $inspect.trace(); });</script>`,
	$host: `<svelte:options customElement="x-y" />\n<script>const h = $host(); console.log(h);</script>`
};

function rune_fixture(rune: (typeof RUNES)[number]): string {
	if (!Object.hasOwn(rune_fixtures, rune)) {
		throw new Error(`Fixture missing for ${rune}`);
	}

	return rune_fixtures[rune];
}

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
		source: `<script>const flip = () => {}; let items = $state([1,2,3]);</script>{#each items as item (item)}<div animate:flip>{item}</div>{/each}`
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
 * Filesystem-safe identifier for an importee like `svelte/internal/client`.
 */
function safe_name(importee: string): string {
	return importee.replace(/[^a-z0-9]+/gi, '_');
}

/**
 * Bundle an entry the way users receive it, so we scan the same code the
 * browser does. Mirrors `check-treeshakeability.js`.
 *
 * `entry_code` is virtual module source: typically `export * from
 * 'svelte/...'` for a runtime entry, or compiled fixture JS for a per-feature
 * scan. `silent` suppresses rollup's circular-dependency warnings — used for
 * fixture bundles where they're known and noisy.
 */
async function bundle(entry_code: string, options: { silent?: boolean } = {}): Promise<string> {
	const built = await rollup({
		input: '__entry__',
		plugins: [
			virtual({ __entry__: entry_code }),
			{
				name: 'resolve-svelte',
				resolveId(id: string) {
					if (id.startsWith('svelte')) {
						const entry = pkg.exports[id.replace('svelte', '.')];
						if (!entry) return;
						if (typeof entry === 'string') return path.resolve(pkg_dir, entry);
						const file = entry.browser ?? entry.default;
						if (file) return path.resolve(pkg_dir, file);
					}
				}
			},
			nodeResolve({ exportConditions: ['production', 'import', 'browser', 'default'] })
		],
		// Treat optional peers / Node-only branches as external so we only scan
		// code that actually runs in the browser.
		external: ['esm-env'],
		onwarn: options.silent
			? () => {}
			: (warning, handler) => {
					if (warning.code === 'CIRCULAR_DEPENDENCY') return;
					handler(warning);
				}
	});

	const { output } = await built.generate({ format: 'esm' });
	await built.close();

	return output
		.filter((chunk): chunk is OutputChunk => chunk.type === 'chunk')
		.map((chunk) => chunk.code)
		.join('\n');
}

/**
 * Read every compiler-emitted client file from the snapshot tests. These
 * fixtures cover the full range of patterns the compiler emits — bindings,
 * transitions, `<svelte:element>`, async derived, hydration markers, etc.
 */
function load_compiler_output_fixtures(): CompilerFixture[] {
	const fixtures: CompilerFixture[] = [];

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
 * Combine per-feature version data into a single Record. Takes the max
 * (strictest) version per browser across the input feature IDs.
 *
 * `null` propagates as "not supported" — if any contributing feature
 * marks a browser unsupported, the merged record does too.
 *
 * Returns `null` if NONE of the IDs have versions in `web-features` or
 * supplemental rules, so callers can fall back to year-based mapping.
 */
function versions_from_features(ids: Iterable<string>): BrowserVersions | null {
	const merged: BrowserVersions = {};
	let any_found = false;

	for (const id of ids) {
		const support = versions_for_feature(id);
		if (!support) continue;
		any_found = true;
		for (const [browser, version] of Object.entries(support)) {
			const current = merged[browser];
			// `null` means "not supported"; propagate it directly.
			if (version === null) {
				merged[browser] = null;
				continue;
			}
			if (current === null) continue; // already known unsupported
			if (current === undefined || Number(version) > Number(current)) {
				merged[browser] = version;
			}
		}
	}

	return any_found ? merged : null;
}

/**
 * Highest baseline year among `detected`, and the set of feature IDs that
 * drove it. Used both for the aggregate runtime floor and for per-fixture
 * scans — the two differ only in their ignore set.
 */
function compute_floor(
	detected: Iterable<string>,
	ignore: Set<string>
): { year: number; drivers: Set<string> } {
	let year = 0;
	const drivers = new Set<string>();
	for (const id of detected) {
		if (ignore.has(id)) continue;
		const y = baseline_year_for_feature(id);
		if (!y) continue;
		if (y > year) {
			year = y;
			drivers.clear();
		}
		if (y === year) drivers.add(id);
	}
	return { year, drivers };
}

/**
 * Run the TS-based detector across the runtime bundles and the compiler-
 * output fixtures, then compute the highest baseline year among the
 * detected features (after subtracting `AGGREGATE_IGNORE`).
 *
 * `runtime_files` are absolute paths to runtime bundle files. Returns the
 * minimum Baseline year the combined code satisfies.
 */
function find_minimum_target(
	runtime_files: string[],
	compiler_fixtures: CompilerFixture[]
): number {
	// Type-aware walk over the runtime bundles.
	const detected = detect_features(runtime_files);

	// Syntax-only walk over the compiler-output fixtures (text only, no
	// program context; the bare TS source-file parser handles the syntax
	// features the compiler emits).
	for (const fixture of compiler_fixtures) {
		for (const id of detect_features_in_text(fixture.code)) detected.add(id);
	}

	const { year, drivers } = compute_floor(detected, AGGREGATE_IGNORE);
	// Floor at 2015 so the docs never claim a pre-ES6 target if every
	// detected feature happens to lack a Baseline year.
	const final_year = Math.max(year, 2015);

	console.log(`  → ${final_year} (features that drove the floor:)`);
	for (const id of [...drivers].sort()) {
		console.log(`    - ${id}`);
	}

	return final_year;
}

/**
 * Verify every entry in `BEHAVIORAL_IGNORE` is actually used by the
 * runtime. Without this, a behavioural suppression can outlive the API
 * it suppresses — the comment stays in the config pointing at code that
 * no longer exists.
 *
 * `SAFE_TO_IGNORE` entries are exempt: they're safe to carry regardless
 * of whether the runtime currently uses the API.
 */
function validate_ignore_features(runtime_files: string[]): void {
	if (BEHAVIORAL_IGNORE.size === 0) return;
	const detected = detect_features(runtime_files);
	const stale = [...BEHAVIORAL_IGNORE].filter((id) => !detected.has(id));
	if (stale.length > 0) {
		throw new Error(
			`BEHAVIORAL_IGNORE contains entries that the detector does not flag — ` +
				`they can be removed:\n` +
				stale.map((id) => `  - ${id}`).join('\n') +
				`\n\nEdit \`packages/svelte/scripts/generate-browser-support.js\` ` +
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
 * `subpackage_exports` maps subpath → list of exported symbols, produced by
 * `enumerate_subpackage_exports`. Passed in rather than computed here so the
 * dynamic-import discovery can happen once in `main`.
 */
function enumerate_features(subpackage_exports: Record<string, string[]>): Feature[] {
	const features: Feature[] = [];

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

	for (const [module, exports] of Object.entries(subpackage_exports)) {
		for (const exp of exports) {
			features.push({
				name: `\`${exp}\` from \`${module}\``,
				kind: 'js',
				source: `import { ${exp} } from '${module}'; export const _ = ${exp};`
			});
		}
	}

	for (const rune of RUNES) {
		features.push({
			name: `\`${rune}\``,
			kind: 'svelte',
			source: rune_fixture(rune)
		});
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
 */
function binding_fixture(name: string, props: BindingProperty): string {
	// Map declared `valid_elements` to a concrete element + minimal attrs
	// so the compiler accepts the binding.
	const tag = (props.valid_elements ?? ['div'])[0];

	const reactive = `let v = $state();`;

	if (tag === 'svelte:window') {
		return `<script>${reactive}</script><svelte:window bind:${name}={v} />`;
	}
	if (tag === 'svelte:document') {
		return `<script>${reactive}</script><svelte:document bind:${name}={v} />`;
	}
	if (tag === 'input') {
		// `bind:checked` and `bind:group` require type="checkbox" | "radio"
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
 * bundle the result through the shared `bundle` helper. Fixtures are tiny
 * so circular-dep warnings from the Svelte runtime are silenced.
 */
async function bundle_fixture(feature: Feature): Promise<string> {
	const entry_code =
		feature.kind === 'svelte'
			? svelte_compile(feature.source, {
					generate: 'client',
					filename: 'Fixture.svelte',
					dev: false
				}).js.code
			: feature.source;
	return bundle(entry_code, { silent: true });
}

/**
 * Detect features in a single fixture bundle and report the per-fixture
 * floor year along with the IDs that drove it. Used for the per-feature
 * conditional table.
 *
 * `fixture_file` is the absolute path to the `.ts` bundle.
 */
function scan_fixture(fixture_file: string): {
	year: number;
	driving_ids: string[];
} {
	const { year, drivers } = compute_floor(detect_features([fixture_file]), SAFE_TO_IGNORE);

	return {
		year,
		driving_ids: [...drivers]
	};
}

/**
 * Iterate every feature, bundle its fixture, scan it. Return the rows
 * that need to appear in the conditional-features table.
 */
async function find_all_conditional_features(
	runtime_floor: RuntimeFloor,
	subpackage_exports: Record<string, string[]>
): Promise<ConditionalRow[]> {
	const runtime_year = typeof runtime_floor === 'number' ? runtime_floor : Infinity;
	const features = enumerate_features(subpackage_exports);
	const rows: ConditionalRow[] = [];

	const missing_doc_links: string[] = [];

	for (let i = 0; i < features.length; i++) {
		const feature = features[i];
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

		const scanned = scan_fixture(fixture_file);
		const final_year = scanned.year;

		// Skip features at or below the runtime floor — they don't need a row.
		if (final_year <= runtime_year || final_year === 0) continue;

		// Use exact per-feature versions where available (from web-features
		// or supplemental rules), falling back to the conservative year
		// mapping only if no feature has explicit version data.
		let versions = versions_from_features(scanned.driving_ids);
		if (!versions) {
			try {
				versions = browser_versions_for(final_year);
			} catch {
				continue;
			}
		}

		let doc_link = doc_links[feature.name];
		if (doc_link === undefined) {
			doc_link = null;
			missing_doc_links.push(feature.name);
		}

		rows.push({
			name: feature.name,
			doc_link,
			versions,
			baseline_year: final_year
		});
	}
	process.stdout.write('\n');

	if (missing_doc_links.length) {
		throw new Error(`Missing documentation url for some features.
Add them to the \`doc_links\` map in \`scripts/generate-browser-support.ts\`, or add an explicit \`null\` if they don't have a documentation url.
${missing_doc_links.map((name) => `  - "${name}"`).join('\n')}`);
	}

	return rows;
}

function render_conditional_table(features: ConditionalRow[], runtime_floor: RuntimeFloor): string {
	if (features.length === 0) {
		return '_No features currently require browser versions newer than the runtime floor._';
	}
	features.sort((a, b) => a.name.localeCompare(b.name));

	const browsers = [
		['chrome', 'Chrome/Edge'],
		['firefox', 'Firefox'],
		['safari', 'Safari']
	] as const;

	const floor_versions = browser_versions_for(runtime_floor);

	const rows: string[][] = [];
	for (const row of features) {
		const name_cell = row.doc_link ? `[${row.name}](${row.doc_link})` : row.name;
		const versions = browsers.map(([key]) => {
			const v = row.versions[key];
			if (v === null) return 'not supported';
			if (v === undefined) return '<span style="color: var(--sk-fg-4)">—</span>';
			const floor_v = floor_versions[key];
			if (floor_v && Number(v) <= Number(floor_v))
				return '<span style="color: var(--sk-fg-4)">—</span>';

			return v;
		});
		rows.push([name_cell, ...versions]);
	}

	return render_markdown_table(['Feature', ...browsers.map(([, label]) => `${label}`)], rows);
}

function browser_versions_for(target: RuntimeFloor): Record<string, string> {
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

	const suffixes = ['_android', '_ios'];

	const lookup: Record<string, string> = {};
	outer: for (const { browser, version } of versions) {
		if (visible_browsers.has(browser)) {
			for (const suffix of suffixes) {
				// skip e.g. 'Chrome (Android)' if it matches Chrome
				if (browser.endsWith(suffix) && version === lookup[browser.replace(suffix, '')]) {
					continue outer;
				}
			}

			lookup[browser] = version;
		}
	}

	return lookup;
}

const BROWSER = {
	chrome: 'Chrome',
	edge: 'Edge',
	firefox: 'Firefox',
	safari: 'Safari',
	opera: 'Opera',
	samsung_internet: 'Samsung Internet',
	webview_android: 'Android WebView',
	internet_explorer: 'Internet Explorer'
};

function render_browser_table(versions: Record<string, string>, target: RuntimeFloor): string {
	const rows: Array<[string, string]> = [
		[BROWSER.chrome, versions.chrome],
		[`${BROWSER.chrome} (Android)`, versions.chrome_android]
	];

	if (versions.chrome === versions.edge) {
		rows[0][0] += `/${BROWSER.edge}`;
	} else {
		rows.push([BROWSER.edge, versions.edge]);
	}

	rows.push(
		[BROWSER.firefox, versions.firefox],
		[`${BROWSER.firefox} (Android)`, versions.firefox_android],
		[BROWSER.safari, versions.safari],
		[`${BROWSER.safari} (iOS)`, versions.safari_ios],
		[BROWSER.opera, versions.opera],
		[`${BROWSER.opera} (Android)`, versions.opera_android],
		[BROWSER.samsung_internet, versions.samsunginternet_android],
		[BROWSER.webview_android, versions.webview_android],
		[BROWSER.internet_explorer, 'not supported']
	);

	const target_label = target === 'newly' ? '"newly available"' : target;

	return (
		render_markdown_table(
			['Browser', 'Minimum version'],
			rows.filter(([, version]) => version !== undefined)
		) +
		`\n\n> [!NOTE] This equates to a <a href="https://web-platform-dx.github.io/baseline/">Baseline</a> target of ${target_label}.`
	);
}

function render_markdown_table(headers: string[], rows: string[][]): string {
	return `| ${headers.join(' | ')} |
| ${headers.map(() => '-').join(' | ')} |
${rows.map((row) => `| ${row.join(' | ')} |`).join('\n')}
`;
}

async function main() {
	console.log('Preparing scratch directory…');
	// Wipe and recreate so stale bundles can't leak into the next scan.
	fs.rmSync(tmp_dir, { recursive: true, force: true });
	fs.mkdirSync(tmp_dir, { recursive: true });

	try {
		console.log('Bundling runtime entries…');
		const runtime_files: string[] = [];
		for (const importee of browser_subpaths().map(importee_for)) {
			// `import * as` + re-export keeps default and named exports
			// alive, so flag modules (only a default export) don't produce
			// empty chunks but their code still ends up in the scan.
			const code = await bundle(`import * as __ns from '${importee}'; export default __ns;`);
			const file = path.join(tmp_dir, `${safe_name(importee)}.ts`);
			fs.writeFileSync(file, code);
			runtime_files.push(file);
		}

		console.log('Loading compiler-output fixtures…');
		const compiler_fixtures = load_compiler_output_fixtures();
		console.log(`  (${compiler_fixtures.length} fixtures found)`);

		console.log('Searching for the minimum Baseline target (type-aware)…');
		const target = find_minimum_target(runtime_files, compiler_fixtures);

		console.log('Checking BEHAVIORAL_IGNORE for stale entries…');
		validate_ignore_features(runtime_files);
		console.log('  no stale entries');

		console.log('Enumerating subpackage exports…');
		const subpackage_exports = await enumerate_subpackage_exports();
		const total_exports = Object.values(subpackage_exports).reduce((n, list) => n + list.length, 0);
		console.log(
			`  ${total_exports} export(s) across ${Object.keys(subpackage_exports).length} subpackage(s)`
		);

		console.log('Scanning per-feature fixtures for conditional requirements…');
		const conditional_rows = await find_all_conditional_features(target, subpackage_exports);
		console.log(
			`  ${conditional_rows.length} feature(s) require browsers newer than the runtime floor`
		);

		console.log('Resolving browser versions…');
		const versions = browser_versions_for(target);

		console.log('Rewriting docs page…');
		generate('browser-support.md', render_browser_table(versions, target));
		generate('browser-support-features.md', render_conditional_table(conditional_rows, target));

		console.log('Done.');
	} finally {
		fs.rmSync(tmp_dir, { recursive: true, force: true });
	}
}

function generate(file: string, content: string): void {
	const filename = path.join(docs_dir, file);

	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
	} catch {}

	const backlink = path.relative(filename, fileURLToPath(import.meta.url));

	fs.writeFileSync(filename, `<!-- generated in ${backlink}. do not edit -->\n\n${content}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
