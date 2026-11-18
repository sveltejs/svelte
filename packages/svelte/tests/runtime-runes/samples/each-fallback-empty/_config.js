import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		const empty = '<div></div><p></p>';
		const filled = '<div><span>a</span><span>b</span></div><p><span>a</span><span>b</span></p>';

		assert.htmlEqual(output.innerHTML, empty);

		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, filled);

		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, empty);

		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, filled);
	}
});
