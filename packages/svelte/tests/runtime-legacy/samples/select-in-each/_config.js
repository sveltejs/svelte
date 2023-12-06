import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<select>
			<option value="a">A</option>
			<option value="b">B</option>
		</select>
		selected: a
	`,

	test({ assert, target }) {
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
				<option value="a">A</option>
				<option value="b">B</option>
			</select>
			selected: b
		`
		);
	}
});
