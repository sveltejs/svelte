import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '1-2',

	test({ assert, component, target }) {
		component.update();
		flushSync();

		assert.htmlEqual(target.innerHTML, '3-4');
	}
});
