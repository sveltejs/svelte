export default {
	/**
	 * @param {import("vitest").assert} assert
	 */
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'x',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: false
			},
			{
				name: 'y',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: false
			},
			{
				name: 'z',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: false
			}
		]);
	}
};
