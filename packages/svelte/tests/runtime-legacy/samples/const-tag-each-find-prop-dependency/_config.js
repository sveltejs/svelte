import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<p></p>',

	test({ assert, component, target }) {
		component.selectedItemId = 'a';
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>2</p>');

		component.selectedItemId = 'b';
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>4</p>');
	}
});
