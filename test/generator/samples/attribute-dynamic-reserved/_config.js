export default {
	data: {
		class: 'foo'
	},

	html: `<div class="foo"></div>123`,

	test ( assert, component, target ) {
		component.set({ class: 'bar' });
		assert.equal( target.innerHTML, `<div class="bar"></div>123` );

		component.destroy();
	}
};
