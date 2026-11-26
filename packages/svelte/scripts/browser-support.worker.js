import fs from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';

/**
 * @typedef {{ key: string; entry_code: string; silent?: boolean }} BundleJob
 * @typedef {{
 *   jobs: BundleJob[];
 *   pkg_exports: Record<string, string | { browser?: string; default?: string }>;
 *   pkg_dir: string;
 * }} WorkerInput
 */

const { jobs, pkg_exports, pkg_dir } = /** @type {WorkerInput} */ (workerData);

const shared_node_resolve = nodeResolve({
	exportConditions: ['production', 'import', 'browser', 'default']
});

/** @type {Map<string, string | null>} */
const relative_cache = new Map();

/** @type {import('rollup').Plugin} */
const resolve_svelte = {
	name: 'resolve-svelte',
	resolveId(id, importer) {
		if (id.startsWith('svelte')) {
			const entry = pkg_exports[id.replace('svelte', '.')];
			if (!entry) return;
			if (typeof entry === 'string') return path.resolve(pkg_dir, entry);
			const file = entry.browser ?? entry.default;
			if (file) return path.resolve(pkg_dir, file);
		}

		if (id.startsWith('.') && importer && !importer.startsWith('\0')) {
			const cache_key = `${importer}\0${id}`;
			let resolved = relative_cache.get(cache_key);
			if (resolved === undefined) {
				const candidate = path.resolve(path.dirname(importer), id);
				resolved = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
				relative_cache.set(cache_key, resolved);
			}
			if (resolved) return resolved;
		}
	}
};

/** @type {Map<string, import('rollup').RollupCache['modules'][number]>} */
const cached_modules = new Map();

/**
 * @param {string} entry_code
 * @param {boolean} silent
 */
async function bundle(entry_code, silent) {
	const built = await rollup({
		input: '__entry__',
		cache: { modules: [...cached_modules.values()] },
		plugins: [virtual({ __entry__: entry_code }), resolve_svelte, shared_node_resolve],
		// Treat optional peers / Node-only branches as external so we only scan
		// code that actually runs in the browser.
		external: ['esm-env'],
		onwarn: silent
			? () => {}
			: (warning, handler) => {
					if (warning.code === 'CIRCULAR_DEPENDENCY') return;
					handler(warning);
				}
	});

	if (built.cache) {
		for (const mod of built.cache.modules) {
			if (!mod.id.includes('__entry__')) {
				cached_modules.set(mod.id, mod);
			}
		}
	}

	const { output } = await built.generate({ format: 'esm' });
	await built.close();

	return output
		.filter((chunk) => chunk.type === 'chunk')
		.map((chunk) => chunk.code)
		.join('\n');
}

/** @type {Array<{ key: string; code: string | null }>} */
const results = [];

for (const job of jobs) {
	try {
		const code = await bundle(job.entry_code, Boolean(job.silent));
		results.push({ key: job.key, code });
	} catch (err) {
		if (!job.silent) throw err;
		results.push({ key: job.key, code: null });
	}
}

parentPort?.postMessage(results);
