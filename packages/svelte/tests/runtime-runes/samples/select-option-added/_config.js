import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, variant }) {
		const [button] = target.querySelectorAll('button');
		const [select] = target.querySelectorAll('select');

		flushSync(() => {
			select.focus();
			select.value = '2';
			select.dispatchEvent(new InputEvent('change', { bubbles: true }));
		});

		assert.equal(select.selectedOptions[0].textContent, '2');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add option</button>
				<p>selected: 2</p>
				<select>
					<option${variant === 'hydrate' ? ' selected=""' : ''}>1</option>
					<option>2</option>
					<option>3</option>
				</select>
			`
		);

		flushSync(() => button.click());
		await tick();

		assert.equal(select.selectedOptions[0].textContent, '2');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add option</button>
				<p>selected: 2</p>
				<select>
					<option${variant === 'hydrate' ? ' selected=""' : ''}>1</option>
					<option>2</option>
					<option>3</option>
					<option>4</option>
				</select>
			`
		);
	}
});
