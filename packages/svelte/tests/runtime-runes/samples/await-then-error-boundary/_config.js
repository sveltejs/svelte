import { tick } from 'svelte';
import { test } from '../../test';

let resolve = (/** @type {any} */ value) => {};

export default test({
	mode: ['client'],

	get props() {
		return { promise: new Promise((r) => (resolve = r)) };
	},

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>loading</p>');

		resolve(1);
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>failed: then error</p>');
	}
});
