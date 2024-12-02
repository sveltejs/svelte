import { flushSync } from 'svelte';
import { test } from '../../test';

/**
 * @type {any[]}
 */
let log;

export default test({
	compileOptions: {
		dev: true
	},

	get props() {
		log = [];
		return {
			push: (/** @type {any} */ ...v) => log.push(...v)
		};
	},

	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		button?.click();
		flushSync();

		assert.deepEqual(log, ['init', 'X', 'update', 'XX', 'update', 'XXX']);
	}
});
