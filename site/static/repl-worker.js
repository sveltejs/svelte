self.window = self; // egregious hack to get magic-string to work in a worker

let ready = false;
let pending_components;
let pending_component;

self.addEventListener('message', async event => {
	switch (event.data.type) {
		case 'init':
			postMessage({
				type: 'version',
				version: await init(event.data.version)
			});
			break;

		case 'bundle':
			if (ready) {
				postMessage({
					type: 'bundled',
					result: await bundle(event.data.components)
				});
			} else {
				pending_components = event.data.components;
			}
			break;

		case 'compile':
			if (ready) {
				postMessage({
					type: 'compiled',
					result: await compile(event.data.component)
				});
			} else {
				pending_component = event.data.component;
			}
			break;
	}
});

const commonCompilerOptions = {
	cascade: false,
	store: true,
	skipIntroByDefault: true,
	nestedTransitions: true,
	dev: true,
};

async function init(version) {
	// TODO use local versions
	importScripts(
		`https://unpkg.com/svelte@${version}/compiler/svelte.js`,
		`https://unpkg.com/rollup/dist/rollup.browser.js`
	);

	if (pending_components) {
		postMessage({
			type: 'bundled',
			result: await bundle(pending_components)
		});

		pending_components = null;
	}

	if (pending_component) {
		postMessage({
			type: 'compiled',
			result: await compile(pending_component)
		});

		pending_component = null;
	}

	ready = true;
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

function compile(component) {
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
