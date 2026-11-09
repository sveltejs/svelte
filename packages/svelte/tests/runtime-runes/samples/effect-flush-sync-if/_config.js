import { flushSync } from 'svelte';
import { test } from '../../test';

// `flushSync` inside an effect renders the branch that the effect's write selects
export default test({
	mode: ['client'],

	test({ assert, target }) {
		flushSync(() => target.querySelector('button')?.click());
		assert.htmlEqual(target.innerHTML, '<button>go</button><p>shown</p>');
	}
});
