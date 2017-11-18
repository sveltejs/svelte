export default {
	data: {
		items: [],
		selected: null
	},

	html: `
		<select></select>
		<p>selected: nothing</p>
	`,

	test ( assert, component, target ) {
		component.set({
			items: [ 'one', 'two', 'three' ],
			selected: 'two'
		});

		const options = target.querySelectorAll( 'option' );
		assert.ok( !options[0].selected );
		assert.ok( options[1].selected );
		assert.ok( !options[2].selected );

		assert.htmlEqual( target.innerHTML, `
			<select>
				<option value='one'>one</option>
				<option value='two'>two</option>
				<option value='three'>three</option>
			</select>
			<p>selected: two</p>
		` );

		component.destroy();
	}
};
