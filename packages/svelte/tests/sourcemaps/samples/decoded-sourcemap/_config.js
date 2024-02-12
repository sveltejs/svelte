import MagicString from 'magic-string';
import { test } from '../../test';
import { magic_string_preprocessor_result, magic_string_replace_all } from '../../helpers.js';

export default test({
	skip: true, // TODO move over to preprocess tests? only checks the preprocessed map. Or move over source map checks from preprocess in this folder?
	preprocess: {
		markup: ({ content, filename = '' }) => {
			const src = new MagicString(content);
			magic_string_replace_all(src, 'replace me', 'success');
			return magic_string_preprocessor_result(filename, src);
		}
	},
	client: [{ str: 'replace me', strGenerated: 'success' }]
});
