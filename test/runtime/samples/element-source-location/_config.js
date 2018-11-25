import * as path from 'path';

export default {
	compileOptions: {
		dev: true
	},

	test({ assert, component, target }) {
		const h1 = target.querySelector('h1');
		const p = target.querySelector('p');

		assert.deepEqual(h1.__svelte_meta.loc, {
			file: path.relative(process.cwd(), path.resolve(__dirname, 'main.html')),
			line: 4,
			column: 0,
			char: 51
		});

		assert.deepEqual(p.__svelte_meta.loc, {
			file: path.relative(process.cwd(), path.resolve(__dirname, 'Foo.html')),
			line: 1,
			column: 1,
			char: 7
		});
	}
};