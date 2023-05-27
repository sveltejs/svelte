export default {
	compileOptions: {
		css: false
	},

	test({ assert, target, window }) {
		const [control, test] = target.querySelectorAll('p');

		assert.equal(window.getComputedStyle(control).color, '');
		assert.equal(window.getComputedStyle(test).color, '');
	}
};
