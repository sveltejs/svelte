import { tick } from 'svelte';
import { test, ok } from '../../test';

export default test({
	html: `
		<input type=text>
		<input type=text>
		<p>x / y</p>

		<button>change to text</button>
		<button>change to number</button>
		<button>change to range</button>
	`,
	ssrHtml: `
		<input type=text value=x>
		<input type=text value=y>
		<p>x / y</p>

		<button>change to text</button>
		<button>change to number</button>
		<button>change to range</button>
	`,
	async test({ assert, target }) {
		const [in1, in2] = target.querySelectorAll('input');
		const [btn1, btn2, btn3] = target.querySelectorAll('button');
		const p = target.querySelector('p');
		ok(p);

		in1.value = '0';
		in2.value = '1';
		in1.dispatchEvent(new window.Event('input', { bubbles: true }));
		in2.dispatchEvent(new window.Event('input', { bubbles: true }));
		await tick();
		btn2?.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 / 1');

		in1.stepUp();
		in1.dispatchEvent(new window.Event('input', { bubbles: true }));
		in2.stepUp();
		in2.dispatchEvent(new window.Event('input', { bubbles: true }));
		await tick();
		assert.htmlEqual(p.innerHTML, '1 / 2');

		btn1?.click();
		await tick();
		try {
			in1.stepUp();
			assert.fail();
		} catch (e) {
			// expected
		}

		btn3?.click();
		await tick();
		in1.stepUp();
		in1.dispatchEvent(new window.Event('input', { bubbles: true }));
		in2.stepUp();
		in2.dispatchEvent(new window.Event('input', { bubbles: true }));
		await tick();
		assert.htmlEqual(p.innerHTML, '2 / 3');

		btn1?.click();
		await tick();
		in1.value = 'a';
		in2.value = 'b';
		in1.dispatchEvent(new window.Event('input', { bubbles: true }));
		in2.dispatchEvent(new window.Event('input', { bubbles: true }));
		await tick();
		assert.htmlEqual(p.innerHTML, 'a / b');
	}
});
