// Regenerates `documentation/docs/07-misc/05-browser-support.md`.
//
// Pipeline:
//   1. Bundle each runtime entry point the same way `check-treeshakeability.js`
//      does, using the `production`/`browser` export conditions so the code
//      we scan matches what end users actually receive.
//   2. Write each bundle to `scripts/_baseline/<entry>.ts` alongside a minimal
//      tsconfig. This is what gives the linter type information — without it
//      the Baseline rule can only see syntax features and constructor names,
//      and it misses instance methods like `String.prototype.replaceAll` or
//      `Array.prototype.toSorted`.
//   3. Run ESLint with `eslint-plugin-baseline-js`'s `recommended-ts` preset
//      (`preset: 'type-aware'`), ratcheting the Baseline year up from 2015
//      until the lint passes. That year is the minimum Baseline floor the
//      combined code satisfies.
//   4. Also scan the compiler-emitted JavaScript from the snapshot tests
//      under `tests/snapshot/samples/*/_expected/client/*.js`. These have
//      no type info, but the patterns the compiler emits are limited, so
//      the syntax-only scan is sufficient there.
//   5. Apply the manual overrides in `KNOWN_API_FLOORS` below for features
//      the scanner cannot see even with type info (string-literal options
//      to constructors, e.g. `box: 'device-pixel-content-box'`).
//   6. Translate the resulting floor into concrete browser versions via
//      `baseline-browser-mapping` and rewrite the table in the docs page.
//
// Required dev dependencies (add to `packages/svelte/package.json`):
//   - eslint
//   - eslint-plugin-baseline-js
//   - @typescript-eslint/parser
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
import { config as eslint_config } from './browser-support.eslint.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg_dir = path.resolve(__dirname, '..');
const repo_root = path.resolve(pkg_dir, '..', '..');
const docs_page = path.join(repo_root, 'documentation/docs/07-misc/05-browser-support.md');
const snapshot_dir = path.join(pkg_dir, 'tests/snapshot/samples');
const tmp_dir = path.join(__dirname, '_baseline');

const pkg = JSON.parse(fs.readFileSync(path.join(pkg_dir, 'package.json'), 'utf-8'));

/**
 * Manual overrides for API floors the scanner cannot detect, even with
 * type information. These come from a manual audit of the runtime and
 * are checked by humans during code review.
 *
 * Each entry declares the minimum Baseline year required by an API. If
 * the scanned floor is older than the entry's year, the entry bumps it.
 *
 * Add an entry here when:
 *   - The API is invoked via a string-literal option that the rule can
 *     only see as a generic constructor call (e.g. `new ResizeObserver({
 *     box: 'device-pixel-content-box' })`).
 *   - The API is referenced via dynamic property access or aliasing.
 *   - You discover the scanner is silently missing something.
 *
 * Do NOT add entries for features that are gated behind a specific
 * directive or import and tree-shaken when unused — those belong in the
 * hand-curated "Per-feature browser requirements" section of the docs
 * page, not here. This list is for things that ship with the always-on
 * runtime.
 *
 * @type {Array<{
 *   api: string,
 *   year: number,
 *   file: string,
 *   reason: string
 * }>}
 */
const KNOWN_API_FLOORS = [
	// Nothing currently — Svelte's always-on runtime is detected
	// accurately by the type-aware scan. Conditional features that
	// exceed the floor are documented in the "Per-feature browser
	// requirements" section of the docs page, not bumped here.
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
 * the highest declared year that exceeds it. Returns the resulting target
 * along with the list of overrides that were applied.
 *
 * @param {number | 'newly'} target
 */
function apply_manual_overrides(target) {
	const target_year = typeof target === 'number' ? target : Infinity;
	const applied = [];
	let bumped = target;

	for (const entry of KNOWN_API_FLOORS) {
		if (entry.year > target_year) {
			applied.push(entry);
			if (typeof bumped !== 'number' || entry.year > bumped) {
				bumped = entry.year;
			}
		}
	}

	return { target: bumped, applied };
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
 * @param {string} table_markdown
 */
function rewrite_docs_page(table_markdown) {
	const source = fs.readFileSync(docs_page, 'utf-8');
	const start = '<!-- generated-table:start -->';
	const end = '<!-- generated-table:end -->';
	const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);

	if (!pattern.test(source)) {
		throw new Error(
			`Could not find generated-table markers in ${docs_page}. ` +
				`Restore the \`${start}\` / \`${end}\` block.`
		);
	}

	const replacement = `${start}\n\n${table_markdown}\n\n${end}`;
	fs.writeFileSync(docs_page, source.replace(pattern, replacement));
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
	const detected = await find_minimum_target(runtime_files, tsconfig, compiler_fixtures);
	console.log(`  → ${detected}`);

	const { target, applied } = apply_manual_overrides(detected);
	if (applied.length > 0) {
		console.log('Applying manual overrides:');
		for (const entry of applied) {
			console.log(`  - ${entry.api} → Baseline ${entry.year} (${entry.reason})`);
		}
		console.log(`  Final target: ${target}`);
	}

	console.log('Resolving browser versions…');
	const versions = browser_versions_for(target);

	console.log('Rewriting docs page…');
	rewrite_docs_page(render_table(versions, target));

	console.log('Cleaning up scratch directory…');
	fs.rmSync(tmp_dir, { recursive: true, force: true });

	console.log('Done.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
