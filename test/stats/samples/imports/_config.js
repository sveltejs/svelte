export default {
	test(assert, stats) {
		assert.deepEqual(stats.imports, [
			{
				source: 'x',
				specifiers: [{ name: 'default', as: 'x' }]
			},
			{
				source: 'y',
				specifiers: [{ name: 'y', as: 'y' }]
			},
			{
				source: 'z',
				specifiers: [{ name: '*', as: 'z' }]
			}
		]);
	}
};