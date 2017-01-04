export default {
	html: `
		<div><p class='widget'>Hello</p></div>
	`,

	test ( assert, component, target ) {
		component.set({ arriving: false });
		assert.htmlEqual( target.innerHTML, `<div><p class='widget'>Goodbye</p></div>` );

		component.teardown();
	}
};
