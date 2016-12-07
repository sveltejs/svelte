export default {
	html: `<div><p>true</p></div>`,

	test ( assert, component, target ) {
		component.set({ foo: true });
		assert.htmlEqual( target.innerHTML, `<div><p>true</p>\n<p>true</p></div>` );

		component.teardown();
	}
};
