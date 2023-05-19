import MagicString from 'magic-string';
import { magic_string_preprocessor_result } from '../../helpers.js';

export default {
	js_map_sources: ['input.svelte'],
	preprocess: [
		{
			script: ({ content }) => {
				const src = new MagicString(content);
				src.prepend('console.log("Injected first line");\n');
				return magic_string_preprocessor_result('input.svelte', src);
			}
		}
	]
};
