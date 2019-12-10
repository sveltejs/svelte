export default {
	test({ assert, component, target, window }) {
		console.log(window.document.querySelectorAll('meta'));
		assert.equal(window.document.querySelectorAll('meta').length, 2);
	}
};
