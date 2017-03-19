export default {
	html: `<div>undefinedxundefined</div>`,

	test ( assert, component, target, window ) {
		const event = new window.Event( 'resize' );

		// JSDOM executes window event listeners with `global` rather than
		// `window` (bug?) so we need to do this
		Object.defineProperties( global, {
			innerWidth: {
				value: 567,
				configurable: true
			},
			innerHeight: {
				value: 456,
				configurable: true
			}
		});

		window.dispatchEvent( event );

		assert.htmlEqual( target.innerHTML, `
			<div>567x456</div>
		`);
	}
};