const values = [
	{ name: 'Alpha' },
	{ name: 'Beta' },
	{ name: 'Gamma' }
];

export default {
	data: {
		values,
		selected: [ values[1] ]
	},

	'skip-ssr': true, // values are rendered as [object Object]

	html: `
		<label>
			<input type="checkbox"> Alpha
		</label>

		<label>
			<input type="checkbox"> Beta
		</label>

		<label>
			<input type="checkbox"> Gamma
		</label>

		<p>Beta</p>`,

	test ( assert, component, target, window ) {
		const inputs = target.querySelectorAll( 'input' );
		assert.equal( inputs[0].checked, false );
		assert.equal( inputs[1].checked, true );
		assert.equal( inputs[2].checked, false );

		const event = new window.Event( 'change' );

		inputs[0].checked = true;
		inputs[0].dispatchEvent( event );

		assert.htmlEqual( target.innerHTML, `
			<label>
				<input type="checkbox"> Alpha
			</label>

			<label>
				<input type="checkbox"> Beta
			</label>

			<label>
				<input type="checkbox"> Gamma
			</label>

			<p>Alpha, Beta</p>
		` );

		component.set({ selected: [ values[1], values[2] ] });
		assert.equal( inputs[0].checked, false );
		assert.equal( inputs[1].checked, true );
		assert.equal( inputs[2].checked, true );

		assert.htmlEqual( target.innerHTML, `
			<label>
				<input type="checkbox"> Alpha
			</label>

			<label>
				<input type="checkbox"> Beta
			</label>

			<label>
				<input type="checkbox"> Gamma
			</label>

			<p>Beta, Gamma</p>
		` );
	}
};
