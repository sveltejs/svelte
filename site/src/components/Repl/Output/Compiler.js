export default class Compiler {
	constructor(version) {
		this.worker = new Worker('/workers/compiler.js');
		this.worker.postMessage({ type: 'init', version });

		this.uid = 1;
		this.handlers = new Map();

		this.worker.onmessage = event => {
			const handler = this.handlers.get(event.data.id);
			handler(event.data.result);
			this.handlers.delete(event.data.id);
		};
	}

	compile(component, options) {
		return new Promise(fulfil => {
			const id = this.uid++;

			this.handlers.set(id, fulfil);

			this.worker.postMessage({
				id,
				type: 'compile',
				source: component.source,
				options: Object.assign({
					name: component.name,
					filename: `${component.name}.svelte`
				}, options),
				entry: component.name === 'App'
			});
		});
	}

	destroy() {
		this.worker.terminate();
	}
}