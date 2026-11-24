import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>1</p>');
		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
	}
});
