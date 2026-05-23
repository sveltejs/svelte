// Regenerates `documentation/docs/07-misc/05-browser-support.md`.
//
// Pipeline:
//   1. Bundle the runtime entry points the same way `check-treeshakeability.js`
//      does, using the `production`/`browser` export conditions so the code
//      we scan matches what end users actually receive.
//   2. Collect compiler-emitted JavaScript from the snapshot test fixtures
//      under `tests/snapshot/samples/*/_expected/client/*.js`. These files
//      are versioned alongside the compiler, so they capture exactly what
//      the compiler emits today without re-compiling anything here.
//   3. Run ESLint with `eslint-plugin-baseline-js`, ratcheting the Baseline
//      target down (`widely` → most recent year → earliest year → `newly`)
//      until the lint passes. That target is the minimum Baseline status
//      the combined code satisfies.
//   4. Translate the target into concrete Chrome / Edge / Firefox / Safari
//      versions via `baseline-browser-mapping`.
//   5. Rewrite the table inside the `<!-- generated-table:start -->` markers
//      in the docs page. Surrounding prose is owned by the docs author.
//
// Required dev dependencies (add to `packages/svelte/package.json`):
//   - eslint
//   - eslint-plugin-baseline-js
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

const pkg = JSON.parse(fs.readFileSync(path.join(pkg_dir, 'package.json'), 'utf-8'));

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
 * @param {string} label
 * @param {string} source
 * @param {number | 'newly'} target
 * @returns {Promise<{ passes: boolean, messages: Array<{ ruleId: string | null, message: string }> }>}
 */
async function lint_at_target(label, source, target) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslint_config(target)
	});
	const [result] = await eslint.lintText(source, { filePath: `${label}.js` });
	return {
		passes: result.errorCount === 0,
		messages: result.messages
	};
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
 * @param {string} runtime_source
 * @param {Array<{ filename: string, code: string }>} compiler_fixtures
 */
async function find_minimum_target(runtime_source, compiler_fixtures) {
	const inputs = [
		{ label: 'runtime', source: runtime_source },
		...compiler_fixtures.map((f) => ({
			label: `compiler-output/${f.filename}`,
			source: f.code
		}))
	];

	/** @type {Map<string, Set<string>>} target → set of feature messages that tripped it */
	const failures_by_target = new Map();

	for (const target of targets) {
		const failures = new Set();
		for (const { label, source } of inputs) {
			const { passes, messages } = await lint_at_target(label, source, target);
			if (!passes) {
				for (const m of messages) {
					if (m.ruleId === 'baseline-js/use-baseline') {
						failures.add(`${label}: ${m.message}`);
					}
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
	console.log('Bundling runtime entries…');
	const runtime_chunks = await Promise.all(runtime_entry_points.map(bundle_runtime));
	const runtime_source = runtime_chunks.join('\n');

	console.log('Loading compiler-output fixtures…');
	const compiler_fixtures = load_compiler_output_fixtures();
	console.log(`  (${compiler_fixtures.length} fixtures found)`);

	console.log('Searching for the minimum Baseline target…');
	const target = await find_minimum_target(runtime_source, compiler_fixtures);
	console.log(`  → ${target}`);

	console.log('Resolving browser versions…');
	const versions = browser_versions_for(target);

	console.log('Rewriting docs page…');
	rewrite_docs_page(render_table(versions, target));

	console.log('Done.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
