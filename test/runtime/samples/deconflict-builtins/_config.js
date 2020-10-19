export default {
	html: '<span>got</span>',

	test({ assert, component }) {
		assert.equal(component.foo, 'got');
	}
};
