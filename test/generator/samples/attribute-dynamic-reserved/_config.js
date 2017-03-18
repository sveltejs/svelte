export default {
	data: {
		class: 'foo'
	},

	html: `<div class="foo"></div>`,

	test ( assert, component, target ) {
		component.set({ class: 'bar' });
		assert.equal( target.innerHTML, `<div class="bar"></div>` );
		
		component.destroy();
	}
};
