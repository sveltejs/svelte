export default {
	'skip-ssr': true,

	props: {
		raw: '<p>does not change</p>'
	},

	html: `<div><p>does not change</p></div>`,

	test ( assert, component, target ) {
		const p = target.querySelector( 'p' );

		component.set({ raw: '<p>does not change</p>' });
		assert.equal( target.innerHTML, `<div><p>does not change</p></div>` );
		assert.strictEqual( target.querySelector( 'p' ), p );

		component.destroy();
	}
};
