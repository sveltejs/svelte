export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'name',
				kind: 'let',
				exported: 'name',
				referenced: true
			},
			{
				name: 'cats',
				kind: 'let',
				exported: 'name',
				referenced: true
			},
			{
				name: 'foo',
				kind: 'let',
				referenced: true
			},
			{
				name: 'bar',
				kind: 'let',
				referenced: true
			}
		]);
	}
};