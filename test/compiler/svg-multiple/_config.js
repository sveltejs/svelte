export default {
	data: {
		x: 0,
		y: 0,
		width: 100,
		height: 100
	},

	html: `
		<svg><rect x="0" y="0" width="100" height="100"></rect></svg>
		<svg><rect x="0" y="0" width="100" height="100"></rect></svg>
	`,

	test ( assert, component, target ) {
		const svgs = target.querySelectorAll( 'svg' );
		const rects = target.querySelectorAll( 'rect' );

		assert.equal( svgs[0].namespaceURI, 'http://www.w3.org/2000/svg' );
		assert.equal( svgs[0].namespaceURI, 'http://www.w3.org/2000/svg' );
		assert.equal( rects[1].namespaceURI, 'http://www.w3.org/2000/svg' );
		assert.equal( rects[1].namespaceURI, 'http://www.w3.org/2000/svg' );

		component.set({ width: 150, height: 50 });
		assert.htmlEqual( target.innerHTML, `
			<svg><rect x="0" y="0" width="150" height="50"></rect></svg>
			<svg><rect x="0" y="0" width="150" height="50"></rect></svg>
		` );
	}
};
