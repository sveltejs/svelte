import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option${variant === 'hydrate' ? ' selected' : ''} value="a">A</option>
				<option value="b">B</option>
			</select>
			selected: a
		`
		);
		const select = target.querySelector('select');
		ok(select);
		const event = new window.Event('change');
		select.value = 'b';
		select.dispatchEvent(event);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option${variant === 'hydrate' ? ' selected' : ''} value="a">A</option>
				<option value="b">B</option>
			</select>
			selected: b
		`
		);
	}
});
