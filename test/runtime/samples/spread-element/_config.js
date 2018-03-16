export default {
	solo: true,

	html: `<div data-foo="bar">red</div>`,

	test ( assert, component, target ) {
		const div = target.querySelector( 'div' );

		assert.equal( div.dataset.foo, 'bar' );

		component.set({ color: 'blue', props: { 'data-foo': 'baz' } });
		assert.equal( target.innerHTML, `<div data-foo="baz">blue</div>` );
		assert.equal( div.dataset.foo, 'baz' );

		component.set({ color: 'blue', props: {} });
		assert.equal( target.innerHTML, `<div>blue</div>` );
		assert.equal( div.dataset.foo, undefined );
	}
};
