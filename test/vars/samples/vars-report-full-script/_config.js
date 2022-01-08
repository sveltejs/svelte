export default {
	options: {
		varsReport: 'full'
	},

	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'foo',
				export_name: 'foo',
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true
			}, {
				name: 'bar',
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
