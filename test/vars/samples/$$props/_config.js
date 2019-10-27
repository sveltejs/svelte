export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: '$$props',
				export_name: null,
				injected: true,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: false
			}
		]);
	}
};