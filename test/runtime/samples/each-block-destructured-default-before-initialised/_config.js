export default {
	error(assert, err) {
		assert.ok(
			err.message === "Cannot access 'c' before initialization" ||
				err.message === 'c is not defined'
		);
	}
};
