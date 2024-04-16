import { tick } from 'svelte';
import { test } from '../../test';

/** @type {typeof console.warn} */
let warn;

/** @type {any[]} */
let warnings = [];

export default test({
	compileOptions: {
		dev: true
	},

	before_test: () => {
		warn = console.warn;

		console.warn = (...args) => {
			warnings.push(...args);
		};
	},

	after_test: () => {
		console.warn = warn;
		warnings = [];
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		await tick();
		assert.deepEqual(warnings.length, 0);
	}
});
