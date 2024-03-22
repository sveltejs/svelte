import { test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {string[]} */
			items: [],
			selected: 'two'
		};
	},

	html: `
		<select></select>
		<p>selected: two</p>
	`,

	async test({ assert, component, target }) {
		component.items = ['one', 'two', 'three'];

		await Promise.resolve(); // mutation observer

		const options = target.querySelectorAll('option');
		assert.ok(!options[0].selected);
		assert.ok(options[1].selected);
		assert.ok(!options[2].selected);

		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option value="one">one</option>
				<option value="two">two</option>
				<option value="three">three</option>
			</select>
			<p>selected: two</p>
		`
		);
	}
});
