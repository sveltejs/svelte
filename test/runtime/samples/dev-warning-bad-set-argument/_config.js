export default {
	dev: true,

	error(assert, error) {
		assert.equal(error.message, `<Main$>.set was called without an object of data key-values to update.`);
	}
};
