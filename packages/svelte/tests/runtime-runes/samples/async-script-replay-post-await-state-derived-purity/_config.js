import { tick } from 'svelte';
import { test } from '../../test';

// Permission to perform ordinary initialization writes must not leak into a
// nested user-derived expression that reads state allocated by that initializer.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		await tick();
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'state_unsafe_mutation');
	}
});
