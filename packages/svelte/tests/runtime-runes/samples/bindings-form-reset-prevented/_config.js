import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [checkbox, input] = target.querySelectorAll('input');
		const button = target.querySelector('button');
		const p = target.querySelector('p');

		checkbox.click();
		input.value = 'hi';
		input.dispatchEvent(new Event('input'));
		flushSync();

		assert.htmlEqual(p?.innerHTML || '', `{"checked":true,"text":"hi"}`);

		button?.click();
		await Promise.resolve();
		flushSync();

		assert.htmlEqual(p?.innerHTML || '', `{"checked":true,"text":"hi"}`);
		assert.equal(checkbox.checked, true);
		assert.equal(input.value, 'hi');
	}
});
