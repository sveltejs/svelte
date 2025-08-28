import { test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {string[]} */
			items: [],
			/** @type {string | null} */
			selected: null
		};
	},

	html: `
		<select></select>
		<p>selected: nothing</p>
	`,

	test({ assert, component, target }) {
		component.items = ['one', 'two', 'three'];
		component.selected = 'two';

		const options = target.querySelectorAll('option');
		assert.ok(!options[0].selected);
		assert.ok(options[1].selected);
		assert.ok(!options[2].selected);

		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option>one</option>
				<option>two</option>
				<option>three</option>
			</select>
			<p>selected: two</p>
		`
		);
	}
});
