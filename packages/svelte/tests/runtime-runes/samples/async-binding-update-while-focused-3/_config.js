import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [shift] = target.querySelectorAll('button');
		shift.click();
		await tick();

		const [select] = target.querySelectorAll('select');

		select.focus();
		select.value = 'three';
		select.dispatchEvent(new InputEvent('change', { bubbles: true }));
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<select>
					<option>one</option>
					<option>two</option>
					<option>three</option>
				</select>
				<p>two</p>
			`
		);
		assert.equal(select.value, 'three');

		select.focus();
		select.value = 'one';
		select.dispatchEvent(new InputEvent('change', { bubbles: true }));
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<select>
					<option>one</option>
					<option>two</option>
					<option>three</option>
				</select>
				<p>two</p>
			`
		);
		assert.equal(select.value, 'one');

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<select>
					<option>one</option>
					<option>two</option>
					<option>three</option>
				</select>
				<p>three</p>
			`
		);
		assert.equal(select.value, 'one');

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<select>
					<option>one</option>
					<option>two</option>
					<option>three</option>
				</select>
				<p>one</p>
			`
		);
		assert.equal(select.value, 'one');
	}
});
