export default {
	skip_if_ssr: true, // TODO would be nice to fix this in SSR as well

	html: `
		<p>selected: a</p>

		<select>
			<option disabled='' value='x'>x</option>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c'>c</option>
		</select>

		<p>selected: a</p>
	`,

	test({ assert, component, target }) {
		assert.equal(component.selected, 'a');
		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		// first enabled option should be selected
		assert.equal(select.value, 'a');
		assert.ok(options[1].selected);
	}
};
