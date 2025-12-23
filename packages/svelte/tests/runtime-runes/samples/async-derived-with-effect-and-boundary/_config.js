import { tick } from 'svelte';
import { test } from '../../test';

// Ensure async derived remains reactive with associated effect and boundary with guard (#17271)
//
// Accounts for both UNINITIALIZED leaking from get and the baz derived remaining NaN
// due to having both an $effect and a boundary with an if in the same template
export default test({
	skip_no_async: true,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>baz: 69</p>
				<p></p>
			`
		);
	}
});
