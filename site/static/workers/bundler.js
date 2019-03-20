self.window = self; // egregious hack to get magic-string to work in a worker

let version;

let fulfil;
let ready = new Promise(f => fulfil = f);

self.addEventListener('message', async event => {
	switch (event.data.type) {
		case 'init':
			version = event.data.version;

			importScripts(
				version === 'local' ?
					'/repl/local?file=compiler.js' :
					`https://unpkg.com/svelte@${version}/compiler.js`,
				`https://unpkg.com/rollup@1/dist/rollup.browser.js`
			);
			fulfil();

			break;

		case 'bundle':
			if (event.data.components.length === 0) return;

			await ready;
			const result = await bundle(event.data);
			if (result) {
				postMessage(result);
			}

			break;
	}
});

const common_options = {
	dev: true,
};

let cached = {
	dom: {},
	ssr: {}
};

const is_svelte_module = id => id === 'svelte' || id.startsWith('svelte/');

const cache = new Map();
function fetch_if_uncached(url) {
	if (!cache.has(url)) {
		cache.set(url, fetch(url.startsWith('https://unpkg.com/svelte@local/') ? '/repl/local?file=' + url.slice(31) : url)
			.then(r => r.text())
			.catch(err => {
				console.error(err);
				cache.delete(url);
			}));
	}

	return cache.get(url);
}

async function get_bundle(mode, cache, lookup) {
	let bundle;
	const all_warnings = [];

	const new_cache = {};

	try {
		bundle = await rollup.rollup({
			input: './App.svelte',
			external: id => {
				if (id[0] === '.') return false;
				if (is_svelte_module(id)) return false;
				if (id.startsWith('https://')) return false;
				return true;
			},
			plugins: [{
				resolveId(importee, importer) {
					// v3 hack
					if (importee === `svelte`) return `https://unpkg.com/svelte@${version}/index.mjs`;
					if (importee.startsWith(`svelte/`)) return `https://unpkg.com/svelte@${version}/${importee.slice(7)}.mjs`;

					if (importer && importer.startsWith(`https://`)) {
						return new URL(`${importee}.mjs`, importer).href;
					}

					if (importee.endsWith('.html')) importee = importee.replace(/\.html$/, '.svelte');

					if (importee in lookup) return importee;

					throw new Error(`Could not resolve "${importee}" from "${importer}"`);
				},
				load(id) {
					if (id.startsWith(`https://`)) return fetch_if_uncached(id);
					if (id in lookup) return lookup[id].source;
				},
				transform(code, id) {
					if (!/\.svelte$/.test(id)) return null;

					const name = id.replace(/^\.\//, '').replace(/\.svelte$/, '');

					const result = cache[id] && cache[id].code === code
						? cache[id].result
						: svelte.compile(code, Object.assign({
							generate: mode,
							format: 'esm',
							name,
							filename: name + '.svelte'
						}, common_options));

					new_cache[id] = { code, result };

					(result.warnings || result.stats.warnings).forEach(warning => { // TODO remove stats post-launch
						all_warnings.push({
							message: warning.message,
							filename: warning.filename,
							start: warning.start,
							end: warning.end
						});
					});

					return result.js;
				}
			}],
			inlineDynamicImports: true,
			onwarn(warning) {
				all_warnings.push({
					message: warning.message
				});
			}
		});
	} catch (error) {
		return { error, bundle: null, cache: new_cache, warnings: all_warnings };
	}

	return { bundle, cache: new_cache, error: null, warnings: all_warnings };
}

async function bundle({ id, components }) {
	// console.clear();
	console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');

	const lookup = {};
	components.forEach(component => {
		const path = `./${component.name}.${component.type}`;
		lookup[path] = component;
	});

	const import_map = new Map();
	let dom;
	let error;

	try {
		dom = await get_bundle('dom', cached.dom, lookup);
		if (dom.error) {
			throw dom.error;
		}

		cached.dom = dom.cache;

		let uid = 1;

		const dom_result = (await dom.bundle.generate({
			format: 'iife',
			name: 'SvelteComponent',
			globals: id => {
				const name = `import_${uid++}`;
				import_map.set(id, name);
				return name;
			},
			exports: 'named',
			sourcemap: true
		})).output[0];

		const ssr = false // TODO how can we do SSR?
			? await get_bundle('ssr', cached.ssr, lookup)
			: null;

		if (ssr) {
			cached.ssr = ssr.cache;
			if (ssr.error) {
				throw ssr.error;
			}
		}

		const ssr_result = ssr
			? (await ssr.bundle.generate({
				format: 'iife',
				name: 'SvelteComponent',
				globals: id => import_map.get(id),
				exports: 'named',
				sourcemap: true
			})).output[0]
			: null;

		return {
			id,
			imports: dom_result.imports,
			import_map,
			dom: dom_result,
			ssr: ssr_result,
			warnings: dom.warnings,
			error: null
		};
	} catch (err) {
		const e = error || err;
		delete e.toString;

		return {
			id,
			imports: [],
			import_map,
			dom: null,
			ssr: null,
			warnings: dom.warnings,
			error: Object.assign({}, e, {
				message: e.message,
				stack: e.stack
			})
		};
	}
}
