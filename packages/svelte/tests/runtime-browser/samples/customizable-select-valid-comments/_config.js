import { flushSync } from 'svelte';
import { ok, test } from '../../assert';

export default test({
	test({ target, assert }) {
		const selects = target.querySelectorAll('select');
		const spans = target.querySelectorAll('option span');
		const legend = target.querySelector('legend');
		const button = /** @type {HTMLButtonElement | null} */ (target.querySelector('#update'));
		const p = target.querySelector('p');
		ok(legend);
		ok(button);
		ok(p);

		assert.equal(spans.length, 3);
		assert.equal(spans[0].textContent, 'Value 1');
		assert.equal(spans[1].textContent, 'Value 1');
		assert.equal(selects[1].value, 'b');
		assert.equal(p.textContent, 'b');

		// These anchors must remain in place, including after hydration.
		for (const element of target.querySelectorAll('select, optgroup, option')) {
			assert.equal(element.lastChild?.nodeType, 8);
			assert.equal(element.lastChild?.textContent, '');
		}

		flushSync(() => button.click());
		assert.equal(spans[0].textContent, 'Changed');
		assert.equal(spans[1].textContent, 'Changed');

		flushSync(() => {
			selects[1].value = 'a';
			selects[1].dispatchEvent(new Event('change'));
		});
		assert.equal(p.textContent, 'a');
	}
});
