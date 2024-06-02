import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const div = target.querySelector('div');

		div?.dispatchEvent(new Event('b'));
		flushSync();
		assert.htmlEqual(target.innerHTML, '<div>b</div>');

		div?.dispatchEvent(new Event('a'));
		flushSync();
		assert.htmlEqual(target.innerHTML, '<div>a</div>');
	}
});
