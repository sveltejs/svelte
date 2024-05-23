import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>0</p>`,

	test({ assert, target }) {
		target.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>1</p>');
	}
});
