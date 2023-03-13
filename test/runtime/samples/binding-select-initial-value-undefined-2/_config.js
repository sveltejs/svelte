export default {
	skip_if_ssr: true, // TODO would be nice to fix this in SSR as well

	html: `
		<p>selected: b</p>

		<select>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c'>c</option>
		</select>

		<p>selected: b</p>
	`,

	test({ assert, component, target }) {
		assert.equal(component.selected, 'b');
		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		// option with selected attribute should be selected
		assert.equal(select.value, 'b');
		assert.ok(options[1].selected);
	}
};
