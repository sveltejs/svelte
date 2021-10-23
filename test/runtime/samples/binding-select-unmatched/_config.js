export default {
	html: `
		<p>selected: null</p>

		<select>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c'>c</option>
		</select>

		<p>selected: null</p>
		<button id="add-attr">add attr</button>
		<button id="remove-attr">remove attr</button>
	`,

	async test({ assert, component, target }) {
		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		assert.equal(component.selected, null);

		// no option should be selected since none of the options matches the bound value
		assert.equal(select.value, '');
		assert.equal(select.selectedIndex, -1);
		assert.ok(!options[0].selected);

		const addAttrButton = target.querySelector('#add-attr');
		addAttrButton.click();
		assert.equal(select.value, 'c');
		// since svelte don't listen the change, the binded value
		// will be null even though there selectedIndex !== -1
		assert.htmlEqual(target.innerHTML, `
			<p>selected: null</p>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c' selected>c</option>
			</select>

			<p>selected: null</p>
			<button id="add-attr">add attr</button>
			<button id="remove-attr">remove attr</button>
		`);
		assert.equal(select.selectedIndex, 2);
		assert.ok(options[2].selected);

		const removeAttrButton = target.querySelector('#remove-attr');
		removeAttrButton.click();

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
			<button id="add-attr">add attr</button>
			<button id="remove-attr">remove attr</button>
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
			<button id="add-attr">add attr</button>
			<button id="remove-attr">remove attr</button>
		`);
	}
};
