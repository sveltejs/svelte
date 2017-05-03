export default {
	data: {
		things: [
			{ name: 'a' },
			{ name: 'b' },
			{ name: 'c' }
		]
	},

	test ( assert, component, target, window, raf ) {
		let divs = target.querySelectorAll( 'div' );
		assert.equal( divs[0].foo, 0 );
		assert.equal( divs[1].foo, 0 );
		assert.equal( divs[2].foo, 0 );

		raf.tick( 50 );
		assert.equal( divs[0].foo, 0.5 );
		assert.equal( divs[1].foo, 0.5 );
		assert.equal( divs[2].foo, 0.5 );

		component.set({
			things: [
				{ name: 'a' },
				{ name: 'woo!' },
				{ name: 'b' },
				{ name: 'c' }
			]
		});
		assert.htmlEqual( target.innerHTML, `
			<div>a</div>
			<div>woo!</div>
			<div>b</div>
			<div>c</div>
		` );
		divs = target.querySelectorAll( 'div' );
		assert.equal( divs[0].foo, 0.5 );
		assert.equal( divs[1].foo, 0 );
		assert.equal( divs[2].foo, 0.5 );
		assert.equal( divs[3].foo, 0.5 );

		raf.tick( 75 );
		assert.equal( divs[0].foo, 0.75 );
		assert.equal( divs[1].foo, 0.25 );
		assert.equal( divs[2].foo, 0.75 );
		assert.equal( divs[3].foo, 0.75 );

		component.destroy();
	}
};