export default {
	html: `ABCD`,

	test({ assert, component }) {
		assert.equal(component.compute(), 'ABCD');
	}
};
