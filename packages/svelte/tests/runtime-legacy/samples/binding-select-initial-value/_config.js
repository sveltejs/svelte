import { ok, test } from '../../test';

export default test({
	html: `
		<p>selected: b</p>

		<select>
			<option>a</option>
			<option>b</option>
			<option>c</option>
		</select>

		<p>selected: b</p>
	`,

	get props() {
		return { selected: 'b' };
	},

	test({ assert, target }) {
		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		assert.equal(select.value, 'b');
		assert.ok(options[1].selected);
	}
});
