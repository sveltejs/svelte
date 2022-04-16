export default {
	html: '<div></div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		assert.equal(div, component.foo);
	}
};
