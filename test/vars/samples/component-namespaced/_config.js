export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'NS',
				export_name: null,
				injected: false,
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