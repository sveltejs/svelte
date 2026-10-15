import { flushSync } from 'svelte';
import { test } from '../../test';

// A render effect in a branch that is created during traversal doesn't run right away (in async mode,
// it runs together with the other render effects of the batch), but its error is still caught by the boundary
export default test({
	mode: ['client'],
	test({ assert, target }) {
		const [show] = target.querySelectorAll('button');

		flushSync(() => show.click());
		assert.htmlEqual(target.innerHTML, '<button>show</button><p>crash</p>');
	}
});
