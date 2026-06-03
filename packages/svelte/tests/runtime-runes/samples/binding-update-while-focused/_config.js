import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');

		flushSync(() => {
			input.focus();
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		});
		assert.equal(input.value, '2');
		assert.htmlEqual(
			target.innerHTML,
			`
				<label>
					<input /> arrow up/down
				</label>
				<p>value = 2</p>
			`
		);

		flushSync(() => {
			input.focus();
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		});
		assert.equal(input.value, '1');
		assert.htmlEqual(
			target.innerHTML,
			`
				<label>
					<input /> arrow up/down
				</label>
				<p>value = 1</p>
			`
		);
	}
});
