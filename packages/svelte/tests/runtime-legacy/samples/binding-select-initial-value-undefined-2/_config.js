import { ok, test } from '../../test';

export default test({
	skip_if_ssr: 'permanent',

	html: `
		<p>selected: b</p>

		<select>
			<option>a</option>
			<option selected="">b</option>
			<option>c</option>
		</select>

		<p>selected: b</p>
	`,

	test({ assert, component, target }) {
		assert.equal(component.selected, 'b');
		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		// option with selected attribute should be selected
		assert.equal(select.value, 'b');
		assert.ok(options[1].selected);
	}
});
