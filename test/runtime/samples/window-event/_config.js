export default {
	html: `<div>undefinedxundefined</div>`,

	skip: true, // some weird stuff happening with JSDOM 11
	// skip: /^v4/.test( process.version ), // node 4 apparently does some dumb stuff
	'skip-ssr': true, // there's some kind of weird bug with this test... it compiles with the wrong require.extensions hook for some bizarre reason

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