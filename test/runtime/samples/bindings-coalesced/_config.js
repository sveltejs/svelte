export default {
	test(assert, component) {
		const { foo, p } = component.refs;

		const values = [];

		Object.defineProperty(p.childNodes[0], 'data', {
			set(value) {
				values.push(value);
			}
		});

		foo.double();

		assert.deepEqual(values, [6]);
	}
};