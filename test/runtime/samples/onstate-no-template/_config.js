export default {
	'skip-ssr': true,

	data: {
		foo: 'woo!'
	},

	test(assert, component) {
		assert.deepEqual(component.changed, { foo: 1 });
	}
};
