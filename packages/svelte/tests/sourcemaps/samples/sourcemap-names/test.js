// needed for workaround, TODO remove
import { getLocator } from 'locate-character';

export function test({ assert, preprocessed, js, css }) {
	assert.deepEqual(
		preprocessed.map.names.sort(),
		['baritone', '--bazitone', 'old_name_1', 'old_name_2'].sort()
	);

	function test_name(old_name, new_name, where) {
		let loc = { character: -1 };
		while ((loc = where.locate(new_name, loc.character + 1))) {
			const actual_mapping = where.mapConsumer.originalPositionFor({
				line: loc.line + 1,
				column: loc.column
			});
			if (actual_mapping.line === null) {
				// location is not mapped - ignore
				continue;
			}
			assert.equal(actual_mapping.name, old_name);
		}
		if (loc === undefined) {
			// workaround for bug in locate-character, TODO remove
			// https://github.com/Rich-Harris/locate-character/pull/5
			where.locate = getLocator(where.code);
		}
	}

	test_name('baritone', 'bar', js);
	test_name('baritone', 'bar', preprocessed);

	test_name('--bazitone', '--baz', css);
	test_name('--bazitone', '--baz', preprocessed);

	test_name('old_name_1', 'new_name_1', js);
	test_name('old_name_1', 'new_name_1', preprocessed);

	test_name('old_name_2', 'new_name_2', js);
	test_name('old_name_2', 'new_name_2', preprocessed);
}
