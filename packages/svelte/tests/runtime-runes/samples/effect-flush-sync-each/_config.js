import { flushSync } from 'svelte';
import { test } from '../../test';

// `flushSync` inside an effect commits the batch with the effect's write while the effect is
// still running. The each block's commit reads the collection, which mustn't make the effect
// depend on it
export default test({
	mode: ['client'],

	test({ assert, target }) {
		flushSync(() => target.querySelector('button')?.click());
		assert.htmlEqual(target.innerHTML, '<button>go</button><p>1</p><p>2</p>');
	}
});
