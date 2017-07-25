export default {
	html: ``,

	data: {
		letter: 'b'
	},

	test ( assert, component, target, window ) {
		component.refs.modal.toggle();

		assert.htmlEqual(target.innerHTML, `
			<span>b</span>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>
		`);

		const select = target.querySelector('select');
		const change = new window.MouseEvent('change');

		select.options[2].selected = true;
		select.dispatchEvent(change);

		assert.htmlEqual(target.innerHTML, `
			<span>c</span>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>
		`);

		component.refs.modal.toggle();
		component.refs.modal.toggle();

		assert.ok(select.options[2].selected);

		assert.htmlEqual(target.innerHTML, `
			<span>c</span>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>
		`);
	}
};
