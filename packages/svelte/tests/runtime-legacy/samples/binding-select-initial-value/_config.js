import { ok, test } from '../../test';

export default test({
	ssrHtml: `
		<p>selected: b</p>

		<select>
			<option>a</option>
			<option selected>b</option>
			<option>c</option>
		</select>

		<p>selected: b</p>
	`,

	get props() {
		return { selected: 'b' };
	},

	test({ assert, target, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>selected: b</p>

			<select>
				<option>a</option>
				<option${variant === 'hydrate' ? ' selected' : ''}>b</option>
				<option>c</option>
			</select>

			<p>selected: b</p>
		`
		);
		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		assert.equal(select.value, 'b');
		assert.ok(options[1].selected);
	}
});
