global.window = self; // egregious hack to get magic-string to work in a worker

const commonCompilerOptions = {
	cascade: false,
	store: true,
	skipIntroByDefault: true,
	nestedTransitions: true,
	dev: true,
};

const svelteCache = new Map();

function loadSvelte(version) {
	if (!svelteCache.has(version)) {
		if (version === 'local') {
			svelteCache.set(version, import(/* webpackChunkName: "svelte" */ 'svelte'));
		} else {
			svelteCache.set(version, new Promise((fulfil => {
				importScripts(`https://unpkg.com/svelte@${version}/compiler/svelte.js`);
				fulfil(global.svelte);
			})))
		}
	}

	return svelteCache.get(version).then(svelte => {
		global.svelte = svelte;
	});
}

export async function init(version) {
	await Promise.all([
		import(/* webpackChunkName: "rollup" */ 'rollup/dist/rollup.browser.js').then(r => {
			global.rollup = r;
		}),
		loadSvelte(version)
	]);

	return version === 'local' ? version : svelte.VERSION;
}

let cached = {
	dom: null,
	ssr: null
};

let currentToken;

async function getBundle(mode, cache, lookup) {
	let bundle;
	let error;
	let warningCount = 0;

	const info = {};

	try {
		bundle = await rollup.rollup({
			input: './App.html',
			external: id => {
				return id[0] !== '.';
			},
			plugins: [{
				resolveId(importee, importer) {
					if (importee in lookup) return importee;
				},
				load(id) {
					if (id in lookup) return lookup[id].source;
				},
				transform(code, id) {
					if (!/\.html$/.test(id)) return null;

					const name = id.replace(/^\.\//, '').replace(/\.html$/, '');

					const { js, css, stats } = svelte.compile(code, Object.assign({
						generate: mode,
						format: 'es',
						name: name,
						filename: name + '.html',
						onwarn: warning => {
							console.warn(warning.message);
							console.log(warning.frame);
							warningCount += 1;
						},
					}, commonCompilerOptions));

					if (stats) {
						if (Object.keys(stats.hooks).filter(hook => stats.hooks[hook]).length > 0) info.usesHooks = true;
					} else if (/[^_]oncreate/.test(code)) {
						info.usesHooks = true;
					}

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

export async function bundle(components) {
	console.clear();
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

		if (token !== currentToken) return;

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

export function compile(component) {
	try {
		const { js } = svelte.compile(component.source, Object.assign({
			// TODO make options configurable
			name: component.name,
			filename: component.name + '.html',
		}, commonCompilerOptions));

		return js.code;
	} catch (err) {
		let result = `/* Error compiling component\n\n${err.message}`;
		if (err.frame) result += `\n${err.frame}`;
		result += `\n\n*/`;
		return result;
	}
}
