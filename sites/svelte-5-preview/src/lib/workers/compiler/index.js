/// <reference lib="webworker" />
self.window = self; //TODO: still need?: egregious hack to get magic-string to work in a worker

/**
 * @type {{
 *   compile: typeof import('svelte/compiler').compile;
 *   compileModule: typeof import('svelte/compiler').compileModule;
 *   VERSION: string;
 * }}
 */
let svelte;

/** @type {(arg?: never) => void} */
let fulfil_ready;
const ready = new Promise((f) => {
	fulfil_ready = f;
});

self.addEventListener(
	'message',
	/** @param {MessageEvent<import("../workers").CompileMessageData>} event */
	async (event) => {
		switch (event.data.type) {
			case 'init':
				const { svelte_url } = event.data;

				const { version } = await fetch(`${svelte_url}/package.json`)
					.then((r) => r.json())
					.catch(() => ({ version: 'experimental' }));

				// unpkg doesn't set the correct MIME type for .cjs files
				// https://github.com/mjackson/unpkg/issues/355
				const compiler = await fetch(`${svelte_url}/compiler.cjs`).then((r) => r.text());
				(0, eval)(compiler + '\n//# sourceURL=compiler.cjs@' + version);

				svelte = globalThis.svelte;

				fulfil_ready();
				break;

			case 'compile':
				await ready;
				postMessage(compile(event.data));
				break;
		}
	}
);

const common_options = {
	dev: false,
	css: false
};

/** @param {import("../workers").CompileMessageData} param0 */
function compile({ id, source, options, return_ast }) {
	try {
		const css = `/* Select a component to see compiled CSS */`;

		if (options.filename.endsWith('.svelte')) {
			const compiled = svelte.compile(source, {
				filename: options.filename,
				generate: options.generate,
				dev: options.dev
			});

			const { js, css, warnings, metadata } = compiled;

			return {
				id,
				result: {
					js: js.code,
					css: css?.code || `/* Add a <sty` + `le> tag to see compiled CSS */`,
					error: null,
					warnings,
					metadata
				}
			};
		} else if (options.filename.endsWith('.svelte.js')) {
			const compiled = svelte.compileModule(source, {
				filename: options.filename,
				generate: options.generate,
				dev: options.dev
			});

			if (compiled) {
				return {
					id,
					result: {
						js: compiled.js.code,
						css,
						error: null,
						warnings: compiled.warnings,
						metadata: compiled.metadata
					}
				};
			}
		}

		return {
			id,
			result: {
				js: `// Select a component, or a '.svelte.js' module that uses runes, to see compiled output`,
				css,
				error: null,
				warnings: [],
				metadata: null
			}
		};
	} catch (err) {
		// @ts-ignore
		let message = `/*\nError compiling ${err.filename ?? 'component'}:\n${err.message}\n*/`;

		return {
			id,
			result: {
				js: message,
				css: message,
				error: {
					message: err.message,
					position: err.position
				},
				warnings: [],
				metadata: null
			}
		};
	}
}
