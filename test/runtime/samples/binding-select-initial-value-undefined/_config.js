export default {
	solo: true,
	show: true,

	html: `
		<p>selected: a</p>

		<select>
			<option>a</option>
			<option>b</option>
			<option>c</option>
		</select>

		<p>selected: a</p>
	`,

	test ( assert, component, target ) {
		const select = target.querySelector( 'select' );
		const options = [ ...target.querySelectorAll( 'option' ) ];

		assert.equal( select.value, 'a' );
		assert.ok( options[0].selected );

		component.destroy();
	}
};
