import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	compileOptions: {
		dev: true
	},
	html: `<button>true</button><button>true</button><input type="checkbox" />`,
	ssrHtml: `<button>true</button><button>true</button><input type="checkbox" checked=""/>`,

	async test({ assert, target, instance }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const input = target.querySelector('input');
		flushSync(() => {
			btn1.click();
		});
		assert.equal(btn1.innerHTML, 'false');
		assert.equal(btn2.innerHTML, 'false');
		assert.equal(input?.checked, false);

		flushSync(() => {
			btn2.click();
		});
		assert.equal(btn1.innerHTML, 'true');
		assert.equal(btn2.innerHTML, 'true');
		assert.equal(input?.checked, true);

		flushSync(() => {
			input?.click();
		});
		assert.equal(btn1.innerHTML, 'false');
		assert.equal(btn2.innerHTML, 'false');
		assert.equal(input?.checked, false);
	}
});
