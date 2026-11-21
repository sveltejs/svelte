import { flushSync } from 'svelte';
import { kind, listen, location } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {string[]} */
let log = [];

/** @type {Map<any, string[]>} */
const lifecycles = new Map();

/** @type {Map<any, number>} */
const depth = new Map();

/** @type {any} */
let user_effect = null;

/** @type {() => void} */
let unlisten;

/**
 * @param {any} effect
 * @param {string} event
 */
function record(effect, event) {
	let list = lifecycles.get(effect);

	if (list === undefined) {
		if (event !== 'created') throw new Error(`${event} before created`);
		lifecycles.set(effect, (list = []));
	}

	list.push(event);
}

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		log = [];
		lifecycles.clear();
		user_effect = null;

		unlisten = listen({
			name: 'test',
			effectCreated(effect) {
				record(effect, 'created');

				if (kind(effect) === 'effect' && location(effect)) {
					user_effect = effect;
					log.push(`created $effect at ${location(effect)}`);
				}
			},
			effectDestroyed(effect) {
				record(effect, 'destroyed');
			},
			reactionRunStart(reaction) {
				if (lifecycles.has(reaction)) record(reaction, 'start');
				depth.set(reaction, (depth.get(reaction) ?? 0) + 1);
				if (reaction === user_effect) log.push('$effect start');
			},
			reactionRunEnd(reaction) {
				if (lifecycles.has(reaction)) record(reaction, 'end');
				depth.set(reaction, /** @type {number} */ (depth.get(reaction)) - 1);
				if (reaction === user_effect) log.push('$effect end');
			},
			flushStart() {
				log.push('flush start');
			},
			flushEnd() {
				log.push('flush end');
			},
			batchCommitted() {
				log.push('committed');
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert, target }) {
		// the deferred top-level $effect keeps its location
		assert.include(log, 'created $effect at main.svelte:5:1');

		const [increment, toggle] = target.querySelectorAll('button');

		log = [];
		flushSync(() => increment.click());

		assert.deepEqual(log, [
			'flush start',
			'$effect start',
			'$effect end',
			'committed',
			'flush end'
		]);

		flushSync(() => toggle.click());
		flushSync(() => toggle.click());

		// every effect lifecycle is balanced: created → (start → end)* → destroyed?
		for (const list of lifecycles.values()) {
			const [first, ...rest] = list;
			assert.equal(first, 'created');

			let i = 0;
			while (rest[i] === 'start') {
				assert.equal(rest[i + 1], 'end');
				i += 2;
			}

			assert.ok(
				i === rest.length || (rest[i] === 'destroyed' && i === rest.length - 1),
				list.join()
			);
		}

		for (const d of depth.values()) assert.equal(d, 0);

		// the `{#if}` branch was destroyed and re-created
		assert.ok([...lifecycles.values()].some((list) => list.at(-1) === 'destroyed'));
	}
});
