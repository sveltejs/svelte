import MagicString from 'magic-string';
import { magic_string_preprocessor_result, magic_string_replace_all } from '../../helpers.js';

export default {
	compile_options: {
		dev: true
	},
	preprocess: [
		{
			style: ({ content, filename }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, '--replace-me-once', '\n --done-replace-once');
				magic_string_replace_all(src, '--replace-me-twice', '\n--almost-done-replace-twice');
				return magic_string_preprocessor_result(filename, src);
			}
		},
		{
			style: ({ content, filename }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, '--almost-done-replace-twice', '\n  --done-replace-twice');
				return magic_string_preprocessor_result(filename, src);
			}
		}
	]
};
