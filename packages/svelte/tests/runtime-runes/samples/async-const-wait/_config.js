import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	props: {
		a_promise: Promise.resolve(10),
		b_promise: Promise.resolve(20)
	},

	async test({ assert, target }) {
		await tick();
		await tick();

		assert.htmlEqual(target.innerHTML, `<p>30</p>`);
	}
});
