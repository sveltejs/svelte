export default {
	/**
	 * @param {import("vitest").assert} assert
	 */
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'a',
				export_name: null,
				injected: false,
				module: true,
				mutated: false,
				reassigned: true,
				referenced: false,
				referenced_from_script: false,
				writable: true
			},
			{
				name: 'b',
				export_name: null,
				injected: false,
				module: true,
				mutated: true,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: true
			},
			{
				name: 'c',
				export_name: null,
				injected: false,
				module: true,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: true
			},
			{
				name: 'd',
				export_name: null,
				injected: false,
				module: true,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: true
			},
			{
				name: 'c',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: true,
				referenced: false,
				referenced_from_script: true,
				writable: true
			},
			{
				name: 'foo',
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
