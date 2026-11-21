import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<input type="checkbox" value="a"><input type="checkbox" value="b"><p></p>`,

	test({ assert, target }) {
		const [a, b] = target.querySelectorAll('input');
		assert.equal(a.checked, false);
		assert.equal(b.checked, false);

		b.click();
		flushSync();

		assert.equal(b.checked, true);
		assert.htmlEqual(
			target.innerHTML,
			`<input type="checkbox" value="a"><input type="checkbox" value="b"><p>b</p>`
		);
	}
});
