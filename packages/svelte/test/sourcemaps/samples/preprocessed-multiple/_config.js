import MagicString from 'magic-string';
import { magic_string_preprocessor_result, magic_string_replace_all } from '../../helpers.js';

export default {
	preprocess: {
		markup: ({ content, filename }) => {
			const src = new MagicString(content);
			magic_string_replace_all(src, 'baritone', 'bar');
			magic_string_replace_all(src, '--bazitone', '--baz');
			return magic_string_preprocessor_result(filename, src);
		},
		script: ({ content, filename }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('bar');
			src.prependLeft(idx, '      ');
			return magic_string_preprocessor_result(filename, src);
		},
		style: ({ content, filename }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('--baz');
			src.prependLeft(idx, '      ');
			return magic_string_preprocessor_result(filename, src);
		}
	}
};
