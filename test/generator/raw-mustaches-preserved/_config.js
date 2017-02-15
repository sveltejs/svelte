const ns = '<noscript></noscript>';

export default {
	'skip-ssr': true,

	data: {
		raw: '<p>does not change</p>'
	},

	html: `<div>${ns}<p>does not change</p>${ns}</div>`,

	test ( assert, component, target ) {
		const p = target.querySelector( 'p' );

		component.set({ raw: '<p>does not change</p>' });
		assert.equal( target.innerHTML, `<div>${ns}<p>does not change</p>${ns}</div>` );
		assert.strictEqual( target.querySelector( 'p' ), p );

		component.teardown();
	}
};
