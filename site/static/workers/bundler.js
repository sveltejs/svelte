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
				`https://unpkg.com/rollup@0.68/dist/rollup.browser.js`
			);
			fulfil();

			break;

		case 'bundle':
			if (event.data.components.length === 0) return;

			await ready;
			const result = await bundle(event.data.components);
			if (result) {
				postMessage(result);
			}

			break;
	}
});

const commonCompilerOptions = {
	dev: true,
};

let cached = {
	dom: null,
	ssr: null
};

let currentToken;

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

async function getBundle(mode, cache, lookup) {
	let bundle;
	let error;
	let warningCount = 0;

	const info = {};

	try {
		bundle = await rollup.rollup({
			input: './App.html',
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

					if (importee in lookup) return importee;
				},
				load(id) {
					if (id.startsWith(`https://`)) return fetch_if_uncached(id);
					if (id in lookup) return lookup[id].source;
				},
				transform(code, id) {
					if (!/\.html$/.test(id)) return null;

					const name = id.replace(/^\.\//, '').replace(/\.html$/, '');

					const { js, css, stats } = svelte.compile(code, Object.assign({
						generate: mode,
						format: 'esm',
						name: name,
						filename: name + '.html',
						onwarn: warning => {
							console.warn(warning.message);
							console.log(warning.frame);
							warningCount += 1;
						},
					}, commonCompilerOptions));

					return js;
				}
			}],
			onwarn(warning) {
				console.warn(warning);
				warningCount += 1;
			},
			cache
		});
	} catch (error) {
		return { error, bundle: null, info: null, warningCount: null }
	}

	return { bundle, info, error: null, warningCount };
}

async function bundle(components) {
	// console.clear();
	console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');

	const token = currentToken = {};

	const lookup = {};
	components.forEach(component => {
		const path = `./${component.name}.${component.type}`;
		lookup[path] = component;
	});

	let dom;
	let error;

	try {
		dom = await getBundle('dom', cached.dom, lookup);
		if (dom.error) {
			throw dom.error;
		}

		if (token !== currentToken) {
			console.error(`aborted`);
			return;
		}

		cached.dom = dom.bundle;

		let uid = 1;
		const importMap = new Map();

		const domResult = await dom.bundle.generate({
			format: 'iife',
			name: 'SvelteComponent',
			globals: id => {
				const name = `import_${uid++}`;
				importMap.set(id, name);
				return name;
			},
			sourcemap: true
		});

		if (token !== currentToken) return;

		const ssr = dom.info.usesHooks
			? await getBundle('ssr', cached.ssr, lookup)
			: null;

		if (ssr) {
			cached.ssr = ssr.bundle;
			if (ssr.error) {
				throw ssr.error;
			}
		}

		if (token !== currentToken) return;

		const ssrResult = ssr
			? await ssr.bundle.generate({
				format: 'iife',
				name: 'SvelteComponent',
				globals: id => importMap.get(id),
				sourcemap: true
			})
			: null;

		return {
			bundle: {
				imports: dom.bundle.imports,
				importMap
			},
			dom: domResult,
			ssr: ssrResult,
			warningCount: dom.warningCount,
			error: null
		};
	} catch (err) {
		const e = error || err;
		delete e.toString;

		return {
			bundle: null,
			dom: null,
			ssr: null,
			warningCount: dom.warningCount,
			error: Object.assign({}, e, {
				message: e.message,
				stack: e.stack
			})
		};
	}
}
