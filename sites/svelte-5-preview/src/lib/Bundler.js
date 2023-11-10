import Worker from './workers/bundler/index.js?worker';

const workers = new Map();

let uid = 1;

export default class Bundler {
	/** @type {Worker} */
	worker;

	/** @param {{ packages_url: string; svelte_url: string; onstatus: (val: string | null) => void}} param0 */
	constructor({ packages_url, svelte_url, onstatus }) {
		const hash = `${packages_url}:${svelte_url}`;

		if (!workers.has(hash)) {
			const worker = new Worker();
			worker.postMessage({ type: 'init', packages_url, svelte_url });
			workers.set(hash, worker);
		}

		this.worker = workers.get(hash);

		this.handlers = new Map();

		this.worker.addEventListener(
			'message',
			/**
			 *
			 * @param {MessageEvent<import('./workers/workers').BundleMessageData>} event
			 * @returns
			 */
			(event) => {
				const handler = this.handlers.get(event.data.uid);

				if (handler) {
					// if no handler, was meant for a different REPL
					if (event.data.type === 'status') {
						onstatus(event.data.message);
						return;
					}

					onstatus(null);
					handler(event.data);
					this.handlers.delete(event.data.uid);
				}
			}
		);
	}

	/**
	 *
	 * @param {import('./types').File[]} files
	 * @returns
	 */
	bundle(files) {
		return new Promise((fulfil) => {
			this.handlers.set(uid, fulfil);

			this.worker.postMessage({
				uid,
				type: 'bundle',
				files
			});

			uid += 1;
		});
	}

	destroy() {
		this.worker.terminate();
	}
}
