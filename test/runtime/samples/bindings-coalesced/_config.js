export default {
	async test({ assert, component }) {
		const { foo, p } = component;

		const values = [];

		Object.defineProperty(p.childNodes[0], 'data', {
			set(value) {
				values.push(value);
			}
		});

		await foo.double();

		assert.deepEqual(values, ['6']);
	}
};