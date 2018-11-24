export default {
	skip: true, // JSDOM

	test({ assert, component, target, window }) {
		assert.equal(window.pageYOffset, 0);

		component.scrollY = 100;
		assert.equal(window.pageYOffset, 100);
	}
};