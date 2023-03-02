export default {
	options: {
		varsReport: false
	},

	test(assert, vars) {
		assert.deepEqual(vars, []);
	}
};
