import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<input type="checkbox"><br>\nChecked:\nfalse`,

	test({ assert, target }) {
		const input = target.querySelector('input');

		input?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<input type="checkbox"><br>\nChecked:\ntrue`);
	}
});
