export default {
	skip: true, // selectedOptions doesn't work in JSDOM???

	html: `
		<p>selected: b</p>

		<select>
			<option>a</option>
			<option>b</option>
			<option>c</option>
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

		component.teardown();
	}
};
