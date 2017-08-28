export default {
	html: `
		One
		Inner
	`,

	test ( assert, component, target ) {
		component.set({ foo: false });
		assert.htmlEqual( target.innerHTML, `` );

		component.set({ foo: true });
		assert.htmlEqual( target.innerHTML, `One\nInner` );
	}
};
