export default {
	html: `
		<div><p class='widget'><slot>Hello</slot></p></div>
	`,

	test ( assert, component, target ) {
		component.set({ arriving: false });
		assert.htmlEqual( target.innerHTML, `<div><p class='widget'><slot>Goodbye</slot></p></div>` );

		component.destroy();
	}
};
