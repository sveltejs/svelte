/** @import { CompileOptions, ModuleCompileOptions } from '#compiler' */
import * as node_module from 'node:module';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '@sveltejs/load-config';
import { compile, compileModule } from '../compiler/index.js';

/**
 * @typedef {{ conditions: string[]; importAttributes: Record<string, string>; parentURL?: string }} ResolveContext
 * @typedef {{ url: string; format?: string | null; importAttributes?: Record<string, string>; shortCircuit?: boolean }} ResolveResult
 * @typedef {(specifier: string, context: ResolveContext, next_resolve: (specifier: string, context?: Partial<ResolveContext>) => ResolveResult) => ResolveResult} ResolveHook
 * @typedef {{ conditions: string[]; format?: string | null; importAttributes: Record<string, string> }} LoadContext
 * @typedef {{ format?: string | null; source?: string | ArrayBuffer | ArrayBufferView | null; shortCircuit?: boolean }} LoadResult
 * @typedef {(url: string, context: LoadContext, next_load: (url: string, context?: Partial<LoadContext>) => LoadResult) => LoadResult} LoadHook
 */

// `registerHooks` is available from Node 22.15 / 23.5 and `stripTypeScriptTypes` from 22.13 / 23.2,
// neither of which is in the version of `@types/node` we currently use
const { registerHooks, stripTypeScriptTypes } = /** @type {typeof node_module & {
	registerHooks?: (hooks: { resolve?: ResolveHook; load?: LoadHook }) => { deregister(): void };
	stripTypeScriptTypes?: (code: string) => string;
}} */ (node_module);

if (typeof registerHooks !== 'function') {
	throw new Error(
		'`svelte/register` requires a version of Node.js that supports `module.registerHooks` (22.15.0 or later)'
	);
}

// Loading the config is async but the hooks are sync, so we load it upfront. This is fine
// because Node waits for modules passed to `--import` before running the entry point.
// Loading the same way as the other tools (language tools, vite-plugin-svelte...) means
// that the config is also found when it's in `vite.config.js` (e.g. in SvelteKit 3)
const loaded = await loadConfig(process.cwd());

if (loaded && 'error' in loaded) {
	throw new Error(`Failed to load Svelte config from ${loaded.configFilePath}`, {
		cause: loaded.error
	});
}

const config = loaded?.config ?? {};

if (Array.isArray(config.preprocess) ? config.preprocess.length > 0 : config.preprocess) {
	// eslint-disable-next-line no-console
	console.warn(
		'`svelte/register` does not support preprocessors: the `preprocess` option of your Svelte config will be ignored'
	);
}

/** @type {CompileOptions} */
const compiler_options = {
	// so that styles are applied without people having to collect and serve the CSS themselves
	css: 'injected',
	...config.compilerOptions
};

// HMR only works within Vite
delete compiler_options.hmr;

if (loaded?.configSource === 'vite') {
	// these are the options resolved by vite-plugin-svelte in `serve` mode, so `dev`
	// is always `true` regardless of what the user configured
	delete compiler_options.dev;
}

/** Search param used to carry import attributes from `resolve` to `load` */
const ATTRIBUTES_PARAM = 'svelte';

const regex_svelte_file = /\.svelte(\.[jt]s)?$/;

const decoder = new TextDecoder();

/**
 * Import attributes are used to choose what to get back from an import:
 *
 * ```js
 * // the client-side component, instead of the default server-side one
 * import App from './App.svelte' with { generate: 'client' };
 * // the compiled code as a string (client-side by default), e.g. to serve it to the browser
 * import source, { css } from './App.svelte' with { as: 'source' };
 * ```
 *
 * Node keys its module cache on the URL alone, so importing the same file with different
 * attributes would return the same module. To avoid that, we encode the attributes in the URL.
 * @type {ResolveHook}
 */
function resolve(specifier, context, next_resolve) {
	const result = next_resolve(specifier, context);

	if (!result.url.startsWith('file:')) return result;

	const url = new URL(result.url);
	if (!regex_svelte_file.test(url.pathname)) return result;

	const attributes = Object.entries(context.importAttributes ?? {});
	if (attributes.length === 0) return result;

	// sort so that the same attributes in a different order result in the same module
	attributes.sort(([a], [b]) => (a < b ? -1 : 1));
	url.searchParams.set(ATTRIBUTES_PARAM, JSON.stringify(Object.fromEntries(attributes)));

	return { ...result, url: url.href };
}

/** @type {LoadHook} */
function load(url, context, next_load) {
	if (!url.startsWith('file:')) return next_load(url, context);

	const { pathname, searchParams } = new URL(url);
	const is_component = pathname.endsWith('.svelte');
	const is_module = /\.svelte\.[jt]s$/.test(pathname);

	if (!is_component && !is_module) return next_load(url, context);

	// We let the rest of the chain (or Node itself) read the file so that other hooks can still
	// provide or modify the source. Node's default `load` can read any file, it only fails when it
	// has to infer the format from an unknown extension — passing `format` explicitly skips that.
	// Import attributes are removed because Node rejects the ones it doesn't know about.
	const result = next_load(url, { ...context, format: 'module', importAttributes: {} });

	let source =
		typeof result.source === 'string'
			? result.source
			: decoder.decode(/** @type {ArrayBuffer | ArrayBufferView} */ (result.source));

	const filename = fileURLToPath(url);

	/** @type {Record<string, string>} */
	const attributes = JSON.parse(searchParams.get(ATTRIBUTES_PARAM) ?? '{}');

	for (const key in attributes) {
		if (key !== 'as' && key !== 'generate') {
			throw new Error(
				`Unsupported import attribute "${key}" for ${filename}: only "as" and "generate" are supported`
			);
		}
	}

	const { as = 'module' } = attributes;

	if (as !== 'module' && as !== 'source') {
		throw new Error(
			`Invalid "as" import attribute for ${filename}: expected "module" or "source", got "${as}"`
		);
	}

	// when asking for the source it's most likely to be served to the browser
	const { generate = as === 'source' ? 'client' : 'server' } = attributes;

	if (generate !== 'client' && generate !== 'server') {
		throw new Error(
			`Invalid "generate" import attribute for ${filename}: expected "client" or "server", got "${generate}"`
		);
	}

	// component-only options are ignored by `compileModule`, so the same options work for both
	/** @type {CompileOptions & ModuleCompileOptions} */
	const options = { ...compiler_options, filename, generate };

	let compiled;

	if (is_component) {
		compiled = compile(source, options);
	} else {
		if (pathname.endsWith('.ts')) {
			if (typeof stripTypeScriptTypes !== 'function') {
				throw new Error(
					`Cannot load ${filename}: this version of Node.js does not support \`module.stripTypeScriptTypes\``
				);
			}

			source = stripTypeScriptTypes(source);
		}

		compiled = compileModule(source, options);
	}

	for (const warning of compiled.warnings) {
		// eslint-disable-next-line no-console
		console.warn(warning.toString());
	}

	if (as === 'source') {
		return {
			format: 'module',
			source:
				`export default ${JSON.stringify(compiled.js.code)};\n` +
				`export const css = ${JSON.stringify(compiled.css?.code ?? null)};`,
			shortCircuit: true
		};
	}

	return {
		format: 'module',
		source: `${compiled.js.code}\n//# sourceMappingURL=${compiled.js.map.toUrl()}`,
		shortCircuit: true
	};
}

registerHooks({ resolve, load });
