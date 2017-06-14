export default {
	'skip-ssr': true, // TODO would be nice to fix this in SSR as well

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
