export default {
	data: {
		values: [1, 2, 3],
		foo: 2
	},

	html: `
		<select>
			<option value='1'>1</option>
			<option value='2'>2</option>
			<option value='3'>3</option>
		</select>

		<p>foo: 2</p>
	`,

	test(assert, component, target, window) {
		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		assert.ok(options[1].selected);
		assert.equal(component.get().foo, 2);

		const change = new window.Event('change');

		options[2].selected = true;
		select.dispatchEvent(change);

		assert.equal(component.get().foo, 3);
		assert.htmlEqual( target.innerHTML, `
			<select>
				<option value='1'>1</option>
				<option value='2'>2</option>
				<option value='3'>3</option>
			</select>

			<p>foo: 3</p>
		` );
	}
};
