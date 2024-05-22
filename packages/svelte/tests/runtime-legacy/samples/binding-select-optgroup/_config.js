import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	ssrHtml: `
		<h1>Hello !</h1>

		<select>
			<option value="Harry">Harry</option>
			<optgroup label="Group">
				<option value="World">World</option>
			</optgroup>
		</select>
	`,

	html: `
		<h1>Hello Harry!</h1>

		<select>
			<option value="Harry">Harry</option>
			<optgroup label="Group">
				<option value="World">World</option>
			</optgroup>
		</select>
	`,

	test({ assert, component, target, window }) {
		const select = target.querySelector('select');
		ok(select);

		const options = [...target.querySelectorAll('option')];

		assert.deepEqual(options, [...select.options]);
		assert.equal(component.name, 'Harry');

		const change = new window.Event('change');

		options[1].selected = true;
		select.dispatchEvent(change);
		flushSync();

		assert.equal(component.name, 'World');
		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Hello World!</h1>

			<select>
				<option value="Harry">Harry</option>
				<optgroup label="Group">
					<option value="World">World</option>
				</optgroup>
			</select>
		`
		);
	}
});
