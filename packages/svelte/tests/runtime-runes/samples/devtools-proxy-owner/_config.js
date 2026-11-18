import { flushSync } from 'svelte';
import { filename, listen } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {string[]} */
let log = [];

/** @type {Map<any, string | undefined>} */
const names = new Map();

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		log = [];
		names.clear();

		unlisten = listen({
			name: 'test',
			componentCreated(ctx) {
				names.set(ctx, filename(ctx)?.split('/').at(-1));
			},
			signalCreated(_, info) {
				if (info.kind !== 'proxy-prop' && info.kind !== 'proxy-version') return;
				const ctx = info.ctx === null ? 'null' : names.get(info.ctx);
				log.push(`${info.label} ${info.location?.split('/').at(-1)} ${ctx}`);
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert, target }) {
		// declared in main.svelte (or a module), first read in Child.svelte or in an event handler
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(log, [
			'obj version main.svelte:4:5 main.svelte',
			'obj.foo main.svelte:4:5 main.svelte',
			'obj.nested main.svelte:4:5 main.svelte',
			'obj.nested version main.svelte:4:5 main.svelte',
			'obj.nested.bar main.svelte:4:5 main.svelte',
			'store.x store.svelte.js:1:13 null',
			'obj.added main.svelte:4:5 main.svelte'
		]);
	}
});
