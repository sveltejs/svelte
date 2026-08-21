import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const addBtn = /** @type {HTMLElement} */ (target.querySelector('button.add'));
		const removeBtn = /** @type {HTMLElement} */ (target.querySelector('button.remove'));

		const btnHtml = '<button class="add">add</button><button class="remove">remove</button>';

		assert.htmlEqual(target.innerHTML, btnHtml);

		addBtn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<span>1</span>${btnHtml}`);

		addBtn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<span>1</span><span>2</span>${btnHtml}`);

		addBtn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<span>1</span><span>2</span><span>3</span>${btnHtml}`);

		removeBtn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<span>1</span><span>2</span>${btnHtml}`);

		removeBtn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<span>1</span>${btnHtml}`);

		addBtn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<span>1</span><span>2</span>${btnHtml}`);
	}
});
