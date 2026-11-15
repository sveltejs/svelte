import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<input type="checkbox" value="a"><input type="checkbox" value="b"><output></output>`,

	test({ assert, target }) {
		const [a, b] = target.querySelectorAll('input');
		const [output] = target.querySelectorAll('output');
		assert.equal(a.checked, false);
		assert.equal(b.checked, false);
		assert.htmlEqual(output.innerHTML, '');

		b.click();
		flushSync();

		assert.equal(b.checked, true);
		assert.htmlEqual(output.innerHTML, 'b');
	}
});
