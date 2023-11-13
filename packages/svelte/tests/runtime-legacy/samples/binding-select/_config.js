import { ok, test } from '../../test';

export default test({
	html: `
		<p>selected: one</p>

		<select>
			<option>one</option>
			<option>two</option>
			<option>three</option>
		</select>

		<p>selected: one</p>
	`,

	get props() {
		return { selected: 'one' };
	},

	async test({ assert, component, target, window }) {
		const select = target.querySelector('select');
		ok(select);

		const options = [...target.querySelectorAll('option')];

		assert.deepEqual(options, [...select.options]);
		assert.equal(component.selected, 'one');

		const change = new window.Event('change');

		options[1].selected = true;
		await select.dispatchEvent(change);

		assert.equal(component.selected, 'two');
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>selected: two</p>

			<select>
				<option>one</option>
				<option>two</option>
				<option>three</option>
			</select>

			<p>selected: two</p>
		`
		);

		component.selected = 'three';
	}
});
