import { flushSync } from 'svelte';
import { kind, listen, location } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {string[]} */
let log = [];

/** @type {any[]} */
let running = [];

/** @type {any[]} */
let effects = [];

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	get props() {
		return {
			/** @param {string} name */
			probe: (name) => {
				const reaction = running.at(-1);
				log.push(`${name}: ${kind(reaction)}`);
			}
		};
	},

	before_test() {
		log = [];
		running = [];
		effects = [];

		unlisten = listen({
			name: 'test',
			effectCreated(effect) {
				effects.push(effect);
			},
			reactionRunStart(reaction) {
				running.push(reaction);
			},
			reactionRunEnd() {
				running.pop();
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert }) {
		flushSync();

		assert.deepEqual(log.toSorted(), [
			'$effect.pre: effectPre',
			'$effect: effect',
			'action: render',
			'attachment: render',
			'onMount: effect',
			'transition: render'
		]);

		// `$effect` and `$effect.pre` have a location, lifecycle functions don't
		const user = effects.filter((e) => kind(e) === 'effect' || kind(e) === 'effectPre');
		assert.deepEqual(user.map((e) => `${kind(e)} ${location(e)}`).toSorted(), [
			'effect main.svelte:7:1',
			'effect undefined',
			'effectPre main.svelte:8:1'
		]);
	}
});
