import MagicString from 'magic-string';
import { magic_string_preprocessor_result } from '../../helpers';

export default {
	js_map_sources: [
		'input.svelte'
	],
	preprocess: [
		{
			script: ({ content, filename }) => {
        const s = new MagicString(content);
        s.prepend('// This script code is approved\n');
        return magic_string_preprocessor_result(filename, s);
      },
      style: ({ content, filename }) => {
        const s = new MagicString(content);
        s.prepend('/* This style code is approved */\n');
        return magic_string_preprocessor_result(filename, s);
			}
		}
	]
};
