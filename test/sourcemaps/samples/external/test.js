import { getLocator } from 'locate-character';
import { COMMON, STYLES } from './_config';

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
			`failed to locate "${code}" in "${filename}"`
		);
	};

	// Transformed script, main file
	assertMapped(input.locate, 'Divs ftw!', 'input.svelte');

	// External files
	assertMapped(getLocator(COMMON), 'height: 100%;', 'common.scss');
	assertMapped(getLocator(STYLES), 'color: orange;', 'styles.scss');
}
