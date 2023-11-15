import { test } from '../../test';

export default test({
	get props() {
		return { item: { name: 'One', key: 'a' } };
	},

	html: `
		<select>
			<option value="a">One</option>
			<option value="b">Two</option>
			<option value="c">Three</option>
		</select>
	`,

	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option value="a">One</option>
				<option value="b">Two</option>
				<option value="c">Three</option>
			</select>
		`
		);

		assert.equal(target.querySelector('select')?.value, 'a');
	}
});
