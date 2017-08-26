export default {
	html: `
		<slot>One
		Inner</slot>
	`,

	test ( assert, component, target ) {
		component.set({ foo: false });
		assert.htmlEqual( target.innerHTML, `` );

		component.set({ foo: true });
		assert.htmlEqual( target.innerHTML, `<slot>One\nInner</slot>` );
	}
};
