export default {
	test({ assert, target, raf }) {
		const div = target.querySelector('div');
		assert.equal(div.foo, undefined);

		raf.tick(50);
		assert.equal(div.foo, undefined);
	}
};
