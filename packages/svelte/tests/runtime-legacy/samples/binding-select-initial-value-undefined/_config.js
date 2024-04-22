import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	html: `
		<p>selected: a</p>

		<select>
			<option disabled=''>x</option>
			<option>a</option>
			<option>b</option>
			<option>c</option>
		</select>

		<p>selected: a</p>
	`,

	test({ assert, component, target }) {
		assert.equal(component.selected, 'a');
		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		// first enabled option should be selected
		assert.equal(select.value, 'a');
		assert.ok(options[1].selected);
	}
});
