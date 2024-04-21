import { tick } from 'svelte';

import { ok, test } from '../../test';

export default test({
	html: `
		<div>false</div>
		<div>false</div>
		<input type="number">
		<input type="number">
		<button>click</button>
	`,

	ssrHtml: `
		<div></div>
		<div></div>
		<input type="number">
		<input type="number">
		<button>click</button>
	`,

	async test({ assert, component, target, window }) {
		const [d1, d2] = target.querySelectorAll('div');
		const [in1, in2] = target.querySelectorAll('input');
		const button = target.querySelector('button');
		ok(in1);
		ok(in2);
		ok(button);
		ok(d1);
		ok(d2);
		assert.equal(d1.textContent, 'false');
		assert.equal(d2.textContent, 'false');
		const event1 = new window.MouseEvent('click', { bubbles: true });
		in1.value = '1';
		await in1.dispatchEvent(event1);
		await tick();
		assert.equal(window.document.activeElement, in1);
		assert.equal(component.a, true);
		assert.equal(component.b, false);
		assert.equal(d1.textContent, 'true');
		assert.equal(d2.textContent, 'false');

		in2.value = '1';
		const event2 = new window.MouseEvent('click', { bubbles: true });
		await in2.dispatchEvent(event2);
		await tick();
		assert.equal(component.a, false);
		assert.equal(component.b, true);
		assert.equal(d1.textContent, 'false');
		assert.equal(d2.textContent, 'true');

		const event3 = new window.MouseEvent('click', { bubbles: true });
		await button.dispatchEvent(event3);
		await tick();

		assert.equal(d1.textContent, 'false');
		assert.equal(d2.textContent, 'false');

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>false</div>
				<div>false</div>
				<input type="number">
				<input type="number">
				<button>click</button>
			`
		);
	}
});
