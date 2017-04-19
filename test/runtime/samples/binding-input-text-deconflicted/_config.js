export default {
	solo: true,

	data: {
		component: {
			name: 'world'
		}
	},

	html: `
		<h1>Hello world!</h1>
		<input>
	`,

	test ( assert, component, target, window ) {
		const input = target.querySelector( 'input' );
		assert.equal( input.value, 'world' );

		const event = new window.Event( 'input' );

		input.value = 'everybody';
		input.dispatchEvent( event );

		assert.equal( target.innerHTML, `
			<h1>Hello everybody!</h1>
			<input>
		` );

		component.set({ name: 'goodbye' });
		assert.equal( input.value, 'goodbye' );
		assert.equal( target.innerHTML, `
			<h1>Hello goodbye!</h1>
			<input>
		` );
	}
};
