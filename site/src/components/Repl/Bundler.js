const workers = new Map();

let uid = 1;

export default class Bundler {
	constructor(version) {
		if (!workers.has(version)) {
			const worker = new Worker('/workers/bundler.js');
			worker.postMessage({ type: 'init', version });
			workers.set(version, worker);
		}

		this.worker = workers.get(version);

		this.handlers = new Map();

		this.worker.addEventListener('message', event => {
			const handler = this.handlers.get(event.data.id);

			if (handler) { // if no handler, was meant for a different REPL
				handler(event.data);
				this.handlers.delete(event.data.id);
			}
		});
	}

	bundle(components) {
		return new Promise(fulfil => {
			const id = uid++;

			this.handlers.set(id, fulfil);

			this.worker.postMessage({
				id,
				type: 'bundle',
				components
			});
		});
	}

	destroy() {
		this.worker.terminate();
	}
}