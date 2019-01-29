export default {
	error(assert, err) {
		assert.equal(err.message, `Cannot bind to a nested property of a store`);
	}
};
