import Worker from '../workers/compiler/index.js?worker';

const workers = new Map();

let uid = 1;

export default class Compiler {
	/** @type {Worker} */
	worker;

	/** @type {Map<number, (...arg: any) => void>} */
	handlers = new Map();

	/** @param {string} svelte_url */
	constructor(svelte_url) {
		if (!workers.has(svelte_url)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', svelte_url });
			workers.set(svelte_url, worker);
		}

		this.worker = workers.get(svelte_url);

		this.worker.addEventListener(
			'message',
			/**
			 * @param {MessageEvent<import('$lib/workers/workers').CompileMessageData>} event
			 */
			(event) => {
				const handler = this.handlers.get(event.data.id);

				if (handler) {
					// if no handler, was meant for a different REPL
					handler(event.data);
					this.handlers.delete(event.data.id);
				}
			}
		);
	}

	/**
	 * @param {import('$lib/types').File} file
	 * @param {import('svelte/compiler').CompileOptions} options
	 * @param {boolean} return_ast
	 * @returns {Promise<import('$lib/workers/workers').CompileMessageData>}
	 */
	compile(file, options, return_ast) {
		return new Promise((fulfil) => {
			const id = uid++;

			this.handlers.set(id, fulfil);

			this.worker.postMessage({
				id,
				type: 'compile',
				source: file.source,
				options: Object.assign(
					{
						name: file.name,
						filename: `${file.name}.${file.type}`
					},
					options
				),
				entry: file.name === 'App',
				return_ast
			});
		});
	}

	destroy() {
		this.worker.terminate();
	}
}
