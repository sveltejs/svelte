export default {
	test({ assert, mod }) {
		assert.deepEqual(mod.preload({ foo: 1 }), { bar: 2 });
	}
};
