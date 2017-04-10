export default {
	html: '<h1>Just some static HTML</h1>',

	test ( assert, component, target, window ) {
		const newComp = new window.SvelteComponent();
		assert.equal(newComp instanceof window.SvelteComponent, true);
	}
};
