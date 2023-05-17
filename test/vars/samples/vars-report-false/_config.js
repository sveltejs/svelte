export default {
	options: {
		varsReport: false
	},

	/**
	 * @param {import("vitest").assert} assert
	 */
	test(assert, vars) {
		assert.deepEqual(vars, []);
	}
};
