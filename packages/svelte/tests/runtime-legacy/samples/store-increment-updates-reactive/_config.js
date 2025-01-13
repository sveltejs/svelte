import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '0',

	test({ assert, component, target }) {
		component.increment();
		flushSync();

		assert.htmlEqual(target.innerHTML, '1');
	}
});
