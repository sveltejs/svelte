export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				kind: 'import',
				imported: 'x',
				default: true,
				source: 'x'
			},
			{
				kind: 'import',
				imported: 'y',
				named: true,
				source: 'y'
			},
			{
				kind: 'import',
				imported: 'y',
				namespace: true,
				source: 'y'
			}
		]);
	}
};