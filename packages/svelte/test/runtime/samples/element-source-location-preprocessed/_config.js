import MagicString from 'magic-string';
import * as path from 'node:path';

// fake preprocessor by doing transforms on the source
const str = new MagicString(
	`<script>
type Foo = 'foo';
let foo = 'foo';
</script>

 <h1>{foo}</h1>
`.replace(/\r\n/g, '\n')
);
str.remove(8, 26); // remove line type Foo = ...
str.remove(55, 56); // remove whitespace before <h1>

export default {
	compileOptions: {
		dev: true,
		sourcemap: str.generateMap({ hires: true })
	},

	test({ assert, target }) {
		const h1 = target.querySelector('h1');

		assert.deepEqual(h1.__svelte_meta.loc, {
			file: path.relative(process.cwd(), path.resolve(__dirname, 'main.svelte')),
			line: 5, // line 4 in main.svelte, but that's the preprocessed code, the original code is above in the fake preprocessor
			column: 1, // line 0 in main.svelte, but that's the preprocessed code, the original code is above in the fake preprocessor
			char: 38 // TODO this is wrong but we can't backtrace it due to limitations, see add_location function usage comment for more info
		});
	}
};
