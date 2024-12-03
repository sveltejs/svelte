import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const p = target.querySelector('p');
		ok(p);

		assert.htmlEqual(p.outerHTML, `<p></p>`);

		btn1.click();
		flushSync();
		assert.htmlEqual(p.outerHTML, `<p>1</p>`);

		btn2.click();
		flushSync();
		assert.htmlEqual(p.outerHTML, `<p></p>`);

		btn1.click();
		flushSync();
		assert.htmlEqual(p.outerHTML, `<p>1</p>`);
	}
});
