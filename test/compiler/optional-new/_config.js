export default {
	html: '',
	test: function ( assert, component, target, window ) {
		const SvelteComponent = window.SvelteComponent;

		assert.equal(new SvelteComponent({}) instanceof SvelteComponent, true);
		assert.equal(SvelteComponent({}) instanceof SvelteComponent, true);
	}
};
