import { flushSync } from 'svelte';
import { componentFunction, filename, listen, parentComponent } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {string[]} */
const events = [];

/** @type {Map<string, any>} */
const contexts = new Map();

/** @param {any} ctx */
const name = (ctx) => (componentFunction(ctx) === undefined ? 'root' : filename(ctx) ?? '?');

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		events.length = 0;
		contexts.clear();

		unlisten = listen({
			name: 'test',
			componentCreated(ctx) {
				events.push(`created ${name(ctx)}`);
				contexts.set(name(ctx), ctx);
			},
			componentInitialized(ctx) {
				events.push(`initialized ${name(ctx)}`);
			},
			componentDestroyed(ctx) {
				events.push(`destroyed ${name(ctx)}`);
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert, target, logs }) {
		assert.deepEqual(events, [
			'created root',
			'created main.svelte',
			'created Child.svelte',
			'initialized Child.svelte',
			'initialized main.svelte',
			'initialized root'
		]);

		assert.equal(parentComponent(contexts.get('Child.svelte')), contexts.get('main.svelte'));
		assert.equal(parentComponent(contexts.get('main.svelte')), contexts.get('root'));

		events.length = 0;

		const [button] = target.querySelectorAll('button');
		flushSync(() => button.click());

		// destroyed after its teardown (onDestroy) ran
		assert.deepEqual(logs, ['child onDestroy']);
		assert.deepEqual(events, ['destroyed Child.svelte']);

		events.length = 0;
		flushSync(() => button.click());

		assert.deepEqual(events, ['created Child.svelte', 'initialized Child.svelte']);
	}
});
