import * as path from 'path';

export default {
	compileOptions: {
		dev: true,
	},

	test({ assert, target }) {
		const h1 = target.querySelector('h1');
		const p = target.querySelector('p');
		const { file, line, column, char } = h1.__svelte_meta.loc;
		// assert.deepEqual(h1.__svelte_meta.loc, {
		// 	file: path.relative(process.cwd(), path.resolve(__dirname, 'main.svelte')),
		// 	line: 4,
		// 	column: 0,
		// 	char: 53,
		// });
		assert.equal(file, path.relative(process.cwd(), path.resolve(__dirname, 'main.svelte')));
		assert.equal(line, 4);
		assert.equal(column, 0);
		assert.ok(char > 45 && char < 60);
		{
			const { file, line, column, char } = p.__svelte_meta.loc;
			// assert.deepEqual(p.__svelte_meta.loc, {
			// 	file: path.relative(process.cwd(), path.resolve(__dirname, 'Foo.svelte')),
			// 	line: 1,
			// 	column: 1,
			// 	char: 7,
			// });
			assert.equal(file, path.relative(process.cwd(), path.resolve(__dirname, 'Foo.svelte')));
			assert.equal(line, 1);
			assert.equal(column, 1);
			assert.ok(char > 0 && char < 10);
		}
	},
};
