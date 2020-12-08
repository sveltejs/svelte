import { getLocator } from 'locate-character';
import { APPEND, PREPEND } from './_config';

export function test({ assert, input, preprocessed }) {

	const assertMapped = (locateInput, code, filename) => {
		const sourceLoc = locateInput(code);
		const transformedLoc = preprocessed.locate_1(code);
		assert.deepEqual(
			preprocessed.mapConsumer.originalPositionFor(transformedLoc),
			{
				source: filename,
				name: null,
				line: sourceLoc.line + 1,
				column: sourceLoc.column
			},
			`failed to locate "${code}"`
		);
	};
	
	// Transformed script, main file
	assertMapped(input.locate, 'let count = 3;', 'input.svelte');

	// Untouched markup, main file
	assertMapped(input.locate, '<h1>Hello world!</h1>', 'input.svelte');

	// External files
	assertMapped(getLocator(PREPEND), '"COUNTER_START"', 'src/prepend.js');
	assertMapped(getLocator(APPEND), '"COUNTER_END"', 'src/append.js');
}
