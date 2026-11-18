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
		const [add, nested, root, module] = target.querySelectorAll('button');

		// declared in main.svelte (or a module), first read in Child.svelte or in an event handler
		flushSync(() => add.click());
		assert.deepEqual(log, [
			'obj version main.svelte:5:5 main.svelte',
			'list version main.svelte:6:5 main.svelte',
			'list.length main.svelte:6:5 main.svelte',
			'obj.foo main.svelte:5:5 main.svelte',
			'obj.nested main.svelte:5:5 main.svelte',
			'obj.nested version main.svelte:5:5 main.svelte',
			'obj.nested.bar main.svelte:5:5 main.svelte',
			'store.x store.svelte.js:1:13 null',
			'store.x version store.svelte.js:1:13 null',
			'store.x.b store.svelte.js:1:13 null',
			'list[0] main.svelte:6:5 main.svelte',
			'obj.added main.svelte:5:5 main.svelte'
		]);

		// values assigned after the declaration keep the declaration's location and component
		log = [];
		flushSync(() => nested.click());
		assert.deepEqual(log, [
			'obj.nested version main.svelte:5:5 main.svelte',
			'obj.nested.bar main.svelte:5:5 main.svelte'
		]);

		log = [];
		flushSync(() => root.click());
		assert.deepEqual(log, [
			'list version main.svelte:6:5 main.svelte',
			'list.length main.svelte:6:5 main.svelte',
			'list[0] main.svelte:6:5 main.svelte',
			'list[0] version main.svelte:6:5 main.svelte',
			'list[0].c main.svelte:6:5 main.svelte'
		]);

		// declared in a module: no component, even when written from one
		log = [];
		flushSync(() => module.click());
		assert.deepEqual(log, [
			'store.x version store.svelte.js:1:13 null',
			'store.x.b store.svelte.js:1:13 null'
		]);
	}
});
