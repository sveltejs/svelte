export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				kind: 'injected',
				exported: 'foo',
				referenced: true
			},
			{
				name: 'Bar',
				kind: 'injected',
				exported: 'Bar',
				referenced: true
			},
			{
				name: 'baz',
				kind: 'injected',
				exported: 'baz',
				referenced: true
			}
		]);
	},
};
