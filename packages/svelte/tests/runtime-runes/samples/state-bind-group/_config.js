import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>+</button><input type="checkbox" value="1"><input type="checkbox" value="2"><input type="checkbox" value="3">\n[]`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.equal(target.querySelectorAll('input')[1].checked, true);
		assert.htmlEqual(
			target.innerHTML,
			`<button>+</button><input type="checkbox" value="1"><input type="checkbox" value="2"><input type="checkbox" value="3">\n["2"]`
		);
	}
});
