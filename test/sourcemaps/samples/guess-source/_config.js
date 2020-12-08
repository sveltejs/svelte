import { magic_string_bundle } from '../../helpers';

export const PREPEND = 'console.log("COUNTER_START")';
export const APPEND = 'console.log("COUNTER_END")';

export default {
	js_map_sources: ['input.svelte', 'src/prepend.js', 'src/append.js'],
	preprocess: [
		{
			script: ({ content }) => {
				return magic_string_bundle([
					{ filename: 'src/prepend.js', code: PREPEND },
					{ filename: 'src/input.svelte', code: content },
					{ filename: 'src/append.js', code: APPEND }
				]);
			}
		}
	]
};
