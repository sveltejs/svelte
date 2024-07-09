import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, raf }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const div = target.querySelector('div');
		ok(div);

		btn1.click();
		flushSync();
		assert.htmlEqual(div.innerHTML, `<div style="opacity: 0;">DIV</div>`);

		raf.tick(100);
		assert.htmlEqual(div.innerHTML, `<div style="">DIV</div>`);

		btn2.click();
		flushSync();
		assert.htmlEqual(div.innerHTML, `<div>DIV</div>`);
	}
});
