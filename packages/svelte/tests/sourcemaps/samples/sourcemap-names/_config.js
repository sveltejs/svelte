import MagicString from 'magic-string';
import { test } from '../../test';
import { magic_string_preprocessor_result, magic_string_replace_all } from '../../helpers.js';

export default test({
	preprocess: [
		{
			markup: ({ content, filename = '' }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, 'baritone', 'bar');
				magic_string_replace_all(src, '--bazitone', '--baz');
				magic_string_replace_all(src, 'old_name_1', 'temp_new_name_1');
				magic_string_replace_all(src, 'old_name_2', 'temp_new_name_2');
				return magic_string_preprocessor_result(filename, src);
			}
		},
		{
			markup: ({ content, filename = '' }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, 'temp_new_name_1', 'temp_temp_new_name_1');
				magic_string_replace_all(src, 'temp_new_name_2', 'temp_temp_new_name_2');
				return magic_string_preprocessor_result(filename, src);
			}
		},
		{
			markup: ({ content, filename = '' }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, 'temp_temp_new_name_1', 'new_name_1');
				magic_string_replace_all(src, 'temp_temp_new_name_2', 'new_name_2');
				return magic_string_preprocessor_result(filename, src);
			}
		}
	],
	client: [
		{ str: 'baritone', strGenerated: 'bar' },
		{ str: 'old_name_1', strGenerated: 'new_name_1' },
		{ str: 'old_name_2', strGenerated: 'new_name_2' }
	],
	preprocessed: [
		{ str: 'baritone', strGenerated: 'bar' },
		{ str: 'old_name_1', strGenerated: 'new_name_1' },
		{ str: 'old_name_2', strGenerated: 'new_name_2' },
		{ str: '--bazitone', strGenerated: '--baz' }
	],
	css: [{ str: 'background-color: var(--bazitone)', strGenerated: 'background-color: var(--baz)' }],
	test({ assert, map_preprocessed }) {
		assert.deepEqual(
			map_preprocessed.names.sort(),
			['baritone', '--bazitone', 'old_name_1', 'old_name_2'].sort()
		);
	}
});
