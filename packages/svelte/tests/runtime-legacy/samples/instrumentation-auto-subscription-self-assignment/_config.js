import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: '[]',

	test({ assert, component, target }) {
		flushSync(() => component.go());
		assert.htmlEqual(target.innerHTML, '[42]');
	}
});
