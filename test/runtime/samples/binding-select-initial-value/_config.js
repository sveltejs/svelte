export default {
	html: `
		<p>selected: b</p>

		<select>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c'>c</option>
		</select>

		<p>selected: b</p>
	`,

	data: {
		selected: 'b'
	},

	test ( assert, component, target ) {
		const select = target.querySelector( 'select' );
		const options = [ ...target.querySelectorAll( 'option' ) ];

		assert.equal( select.value, 'b' );
		assert.ok( options[1].selected );

		component.destroy();
	}
};
