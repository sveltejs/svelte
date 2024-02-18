/// <reference lib="webworker" />

import '../patch_window.js';
import { sleep } from '$lib/utils.js';
import { rollup } from '@rollup/browser';
import { DEV } from 'esm-env';
import * as resolve from 'resolve.exports';
import commonjs from './plugins/commonjs.js';
import glsl from './plugins/glsl.js';
import json from './plugins/json.js';
import replace from './plugins/replace.js';
import loop_protect from './plugins/loop-protect.js';

/** @type {string} */
var pkg_name;

/** @type {string} */
let packages_url;

/** @type {string} */
let svelte_url;

/** @type {number} */
let current_id;

/** @type {(arg?: never) => void} */
let fulfil_ready;
const ready = new Promise((f) => {
	fulfil_ready = f;
});

/**
 * @type {{
 *   compile: typeof import('svelte/compiler').compile;
 *   compileModule: typeof import('svelte/compiler').compileModule;
 *   VERSION: string;
 * }}
 */
let svelte;

self.addEventListener(
	'message',
	/** @param {MessageEvent<import('../workers.js').BundleMessageData>} event */ async (event) => {
		switch (event.data.type) {
			case 'init': {
				({ packages_url, svelte_url } = event.data);

				const { version } = await fetch(`${svelte_url}/package.json`).then((r) => r.json());
				console.log(`Using Svelte compiler version ${version}`);

				// unpkg doesn't set the correct MIME type for .cjs files
				// https://github.com/mjackson/unpkg/issues/355
				const compiler = await fetch(`${svelte_url}/compiler.cjs`).then((r) => r.text());
				(0, eval)(compiler + '\n//# sourceURL=compiler.cjs@' + version);

				svelte = globalThis.svelte;

				fulfil_ready();
				break;
			}

			case 'bundle': {
				await ready;
				const { uid, files } = event.data;

				if (files.length === 0) return;

				current_id = uid;

				setTimeout(async () => {
					if (current_id !== uid) return;

					const result = await bundle({ uid, files });

					if (JSON.stringify(result.error) === JSON.stringify(ABORT)) return;
					if (result && uid === current_id) postMessage(result);
				});

				break;
			}
		}
	}
);

/** @type {Record<'client' | 'server', Map<string, { code: string, result: ReturnType<typeof svelte.compile> }>>} */
let cached = {
	client: new Map(),
	server: new Map()
};

const ABORT = { aborted: true };

/** @type {Map<string, Promise<{ url: string; body: string; }>>} */
const FETCH_CACHE = new Map();

/**
 * @param {string} url
 * @param {number} uid
 */
async function fetch_if_uncached(url, uid) {
	if (FETCH_CACHE.has(url)) {
		return FETCH_CACHE.get(url);
	}

	// TODO: investigate whether this is necessary
	await sleep(50);
	if (uid !== current_id) throw ABORT;

	const promise = fetch(url)
		.then(async (r) => {
			if (!r.ok) throw new Error(await r.text());

			return {
				url: r.url,
				body: await r.text()
			};
		})
		.catch((err) => {
			FETCH_CACHE.delete(url);
			throw err;
		});

	FETCH_CACHE.set(url, promise);
	return promise;
}

/**
 * @param {string} url
 * @param {number} uid
 */
async function follow_redirects(url, uid) {
	const res = await fetch_if_uncached(url, uid);
	return res?.url;
}

/**
 *
 * @param {number} major
 * @param {number} minor
 * @param {number} patch
 * @returns {number}
 */
function compare_to_version(major, minor, patch) {
	const v = svelte.VERSION.match(/^(\d+)\.(\d+)\.(\d+)/);

	// @ts-ignore
	return +v[1] - major || +v[2] - minor || +v[3] - patch;
}

function is_v4() {
	return compare_to_version(4, 0, 0) >= 0;
}

function is_v5() {
	return compare_to_version(5, 0, 0) >= 0;
}

function is_legacy_package_structure() {
	return compare_to_version(3, 4, 4) <= 0;
}

function has_loopGuardTimeout_feature() {
	return compare_to_version(3, 14, 0) >= 0;
}

/**
 *
 * @param {Record<string, unknown>} pkg
 * @param {string} subpath
 * @param {number} uid
 * @param {string} pkg_url_base
 */
async function resolve_from_pkg(pkg, subpath, uid, pkg_url_base) {
	// match legacy Rollup logic — pkg.svelte takes priority over pkg.exports
	if (typeof pkg.svelte === 'string' && subpath === '.') {
		return pkg.svelte;
	}

	// modern
	if (pkg.exports) {
		try {
			const [resolved] =
				resolve.exports(pkg, subpath, {
					browser: true,
					conditions: ['svelte', 'development']
				}) ?? [];

			return resolved;
		} catch {
			throw `no matched export path was found in "${pkg_name}/package.json"`;
		}
	}

	// legacy
	if (subpath === '.') {
		let resolved_id = resolve.legacy(pkg, {
			fields: ['browser', 'module', 'main']
		});

		if (typeof resolved_id === 'object' && !Array.isArray(resolved_id)) {
			const subpath = resolved_id['.'];
			if (subpath === false) return 'data:text/javascript,export {}';

			resolved_id =
				subpath ??
				resolve.legacy(pkg, {
					fields: ['module', 'main']
				});
		}

		if (!resolved_id) {
			// last ditch — try to match index.js/index.mjs
			for (const index_file of ['index.mjs', 'index.js']) {
				try {
					const indexUrl = new URL(index_file, `${pkg_url_base}/`).href;
					return (await follow_redirects(indexUrl, uid)) ?? '';
				} catch {
					// maybe the next option will be successful
				}
			}

			throw `could not find entry point in "${pkg_name}/package.json"`;
		}

		return resolved_id;
	}

	if (typeof pkg.browser === 'object') {
		// this will either return `pkg.browser[subpath]` or `subpath`
		return resolve.legacy(pkg, {
			browser: subpath
		});
	}

	return subpath;
}

/**
 * @param {number} uid
 * @param {'client' | 'server'} mode
 * @param {typeof cached['client']} cache
 * @param {Map<string, import('$lib/types.js').File>} local_files_lookup
 */
async function get_bundle(uid, mode, cache, local_files_lookup) {
	let bundle;

	/** A set of package names (without subpaths) to include in pkg.devDependencies when downloading an app */
	/** @type {Set<string>} */
	const imports = new Set();

	/** @type {import('$lib/types.js').Warning[]} */
	const warnings = [];

	/** @type {{ message: string }[]} */
	const all_warnings = [];

	/** @type {typeof cache} */
	const new_cache = new Map();

	/** @type {import('@rollup/browser').Plugin} */
	const repl_plugin = {
		name: 'svelte-repl',
		async resolveId(importee, importer) {
			if (uid !== current_id) throw ABORT;
			const v5 = is_v5();
			const v4 = !v5 && is_v4();

			if (!v5) {
				// importing from Svelte
				if (importee === `svelte`)
					return v4 ? `${svelte_url}/src/runtime/index.js` : `${svelte_url}/index.mjs`;

				if (importee.startsWith(`svelte/`)) {
					const sub_path = importee.slice(7);
					if (v4) {
						return `${svelte_url}/src/runtime/${sub_path}/index.js`;
					}

					return is_legacy_package_structure()
						? `${svelte_url}/${sub_path}.mjs`
						: `${svelte_url}/${sub_path}/index.mjs`;
				}
			}

			// importing from another file in REPL
			if (local_files_lookup.has(importee) && (!importer || local_files_lookup.has(importer)))
				return importee;
			if (local_files_lookup.has(importee + '.js')) return importee + '.js';
			if (local_files_lookup.has(importee + '.json')) return importee + '.json';

			// remove trailing slash
			if (importee.endsWith('/')) importee = importee.slice(0, -1);

			// importing from a URL
			if (/^https?:/.test(importee)) return importee;

			if (importee.startsWith('.')) {
				if (importer && local_files_lookup.has(importer)) {
					// relative import in a REPL file
					// should've matched above otherwise importee doesn't exist
					console.error(`Cannot find file "${importee}" imported by "${importer}" in the REPL`);
					return;
				} else {
					// relative import in an external file
					const url = new URL(importee, importer).href;
					self.postMessage({ type: 'status', uid, message: `resolving ${url}` });

					return await follow_redirects(url, uid);
				}
			} else {
				// fetch from unpkg
				self.postMessage({ type: 'status', uid, message: `resolving ${importee}` });

				const match = /^((?:@[^/]+\/)?[^/]+)(\/.+)?$/.exec(importee);
				if (!match) {
					return console.error(`Invalid import "${importee}"`);
				}

				const pkg_name = match[1];
				const subpath = `.${match[2] ?? ''}`;

				// if this was imported by one of our files, add it to the `imports` set
				if (importer && local_files_lookup.has(importer)) {
					imports.add(pkg_name);
				}

				const fetch_package_info = async () => {
					try {
						const pkg_url = await follow_redirects(
							`${pkg_name === 'svelte' ? '' : packages_url}/${pkg_name}/package.json`,
							uid
						);

						if (!pkg_url) throw new Error();

						const pkg_json = (await fetch_if_uncached(pkg_url, uid))?.body;
						const pkg = JSON.parse(pkg_json ?? '""');

						const pkg_url_base = pkg_url.replace(/\/package\.json$/, '');

						return {
							pkg,
							pkg_url_base
						};
					} catch (_e) {
						throw new Error(`Error fetching "${pkg_name}" from unpkg. Does the package exist?`);
					}
				};

				const { pkg, pkg_url_base } = await fetch_package_info();

				try {
					const resolved_id = await resolve_from_pkg(pkg, subpath, uid, pkg_url_base);
					return new URL(resolved_id + '', `${pkg_url_base}/`).href;
				} catch (reason) {
					throw new Error(`Cannot import "${importee}": ${reason}.`);
				}
			}
		},
		async load(resolved) {
			if (uid !== current_id) throw ABORT;

			const cached_file = local_files_lookup.get(resolved);
			if (cached_file) return cached_file.source;

			if (!FETCH_CACHE.has(resolved)) {
				self.postMessage({ type: 'status', uid, message: `fetching ${resolved}` });
			}

			const res = await fetch_if_uncached(resolved, uid);
			return res?.body;
		},
		transform(code, id) {
			if (uid !== current_id) throw ABORT;

			self.postMessage({ type: 'status', uid, message: `bundling ${id}` });

			if (!/\.(svelte|js)$/.test(id)) return null;

			const name = id.split('/').pop()?.split('.')[0];

			const cached_id = cache.get(id);
			let result;

			if (cached_id && cached_id.code === code) {
				result = cached_id.result;
			} else if (id.endsWith('.svelte')) {
				result = svelte.compile(code, {
					filename: name + '.svelte',
					generate: 'client',
					dev: true
				});

				if (result.css) {
					result.js.code +=
						'\n\n' +
						`
					const $$__style = document.createElement('style');
					$$__style.textContent = ${JSON.stringify(result.css.code)};
					document.head.append($$__style);
				`.replace(/\t/g, '');
				}
			} else if (id.endsWith('.svelte.js')) {
				result = svelte.compileModule(code, {
					filename: name + '.js',
					generate: 'client',
					dev: true
				});
				if (!result) {
					return null;
				}
			} else {
				return null;
			}

			new_cache.set(id, { code, result });

			// @ts-expect-error
			(result.warnings || result.stats?.warnings)?.forEach((warning) => {
				// This is required, otherwise postMessage won't work
				// @ts-ignore
				delete warning.toString;
				// TODO remove stats post-launch
				// @ts-ignore
				warnings.push(warning);
			});

			/** @type {import('@rollup/browser').TransformResult} */
			const transform_result = {
				code: result.js.code,
				map: result.js.map
			};

			return transform_result;
		}
	};

	try {
		bundle = await rollup({
			input: './__entry.js',
			plugins: [
				repl_plugin,
				commonjs,
				json,
				glsl,
				loop_protect,
				replace({
					'process.env.NODE_ENV': JSON.stringify('production')
				})
			],
			inlineDynamicImports: true,
			onwarn(warning) {
				all_warnings.push({
					message: warning.message
				});
			}
		});

		return {
			bundle,
			imports: Array.from(imports),
			cache: new_cache,
			error: null,
			warnings,
			all_warnings
		};
	} catch (error) {
		return { error, imports: null, bundle: null, cache: new_cache, warnings, all_warnings };
	}
}

/**
 * @param {{ uid: number; files: import('$lib/types.js').File[] }} param0
 * @returns
 */
async function bundle({ uid, files }) {
	if (!DEV) {
		console.clear();
		console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');
	}

	/** @type {Map<string, import('$lib/types').File>} */
	const lookup = new Map();

	lookup.set('./__entry.js', {
		name: '__entry',
		source: `
			export { mount, unmount } from 'svelte';
			export {default as App} from './App.svelte';
		`,
		type: 'js',
		modified: false
	});

	files.forEach((file) => {
		const path = `./${file.name}.${file.type}`;
		lookup.set(path, file);
	});

	/** @type {Awaited<ReturnType<typeof get_bundle>>} */
	let client = await get_bundle(uid, 'client', cached.client, lookup);
	let error;

	try {
		if (client.error) {
			throw client.error;
		}

		cached.client = client.cache;

		const client_result = (
			await client.bundle?.generate({
				format: 'iife',
				exports: 'named'
				// sourcemap: 'inline'
			})
		)?.output[0];

		const server = false // TODO how can we do SSR?
			? await get_bundle(uid, 'server', cached.server, lookup)
			: null;

		if (server) {
			cached.server = server.cache;
			if (server.error) {
				throw server.error;
			}
		}

		const server_result = server
			? (
					await server.bundle?.generate({
						format: 'iife',
						name: 'SvelteComponent',
						exports: 'named'
						// sourcemap: 'inline'
					})
				)?.output?.[0]
			: null;

		return {
			uid,
			client: client_result,
			server: server_result,
			imports: client.imports,
			warnings: client.warnings,
			error: null
		};
	} catch (err) {
		console.error(err);

		/** @type {Error} */
		// @ts-ignore
		const e = error || err;

		// @ts-ignore
		delete e.toString;

		return {
			uid,
			client: null,
			server: null,
			imports: null,
			warnings: client.warnings,
			error: Object.assign({}, e, {
				message: e.message,
				stack: e.stack
			})
		};
	}
}
