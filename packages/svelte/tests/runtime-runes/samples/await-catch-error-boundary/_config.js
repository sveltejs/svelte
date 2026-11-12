import { tick } from 'svelte';
import { test } from '../../test';

let reject = (/** @type {any} */ error) => {};

export default test({
	mode: ['client'],

	get props() {
		return { promise: new Promise((_, r) => (reject = r)) };
	},

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>loading</p>');

		reject(new Error('rejected'));
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>failed: catch error</p>');
	}
});
