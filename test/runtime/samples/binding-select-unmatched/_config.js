export default {
	html: `
		<p>selected: null</p>

		<select>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c'>c</option>
		</select>

		<p>selected: null</p>
	`,

	async test({ assert, component, target }) {
		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		assert.equal(component.selected, null);

		// no option should be selected since none of the options matches the bound value
		assert.equal(select.value, '');
		assert.equal(select.selectedIndex, -1);
		assert.ok(!options[0].selected);

		component.selected = 'a'; // first option should now be selected
		assert.equal(select.value, 'a');
		assert.ok(options[0].selected);

		assert.htmlEqual(target.innerHTML, `
			<p>selected: a</p>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>

			<p>selected: a</p>
		`);

		component.selected = 'd'; // doesn't match an option

		// now no option should be selected again
		assert.equal(select.value, '');
		assert.equal(select.selectedIndex, -1);
		assert.ok(!options[0].selected);

		assert.htmlEqual(target.innerHTML, `
			<p>selected: d</p>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>

			<p>selected: d</p>
		`);

		component.selected = 'b'; // second option should now be selected
		assert.equal(select.value, 'b');
		assert.ok(options[1].selected);

		assert.htmlEqual(target.innerHTML, `
			<p>selected: b</p>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>

			<p>selected: b</p>
		`);

		component.selected = undefined; // also doesn't match an option

		// now no option should be selected again
		assert.equal(select.value, '');
		assert.equal(select.selectedIndex, -1);
		assert.ok(!options[0].selected);

		assert.htmlEqual(target.innerHTML, `
			<p>selected: undefined</p>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>

			<p>selected: undefined</p>
		`);
	}
};
