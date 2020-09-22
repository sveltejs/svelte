import MagicString from 'magic-string';

function replace(search, replace, content, src, options = { storeName: true }) {
	let idx = -1;
	while ((idx = content.indexOf(search, idx + 1)) != -1) {
		src.overwrite(idx, idx + search.length, replace, options);
	}
}

function result(src, filename) {
	return {
		code: src.toString(),
		map: src.generateMap({
			source: filename,
			hires: true,
			includeContent: false
		})
	};
}

export default {
	preprocess: [
		{
			markup: ({ content, filename }) => {
				const src = new MagicString(content);
				replace('baritone', 'bar', content, src);
				replace('--bazitone', '--baz', content, src);
				replace('old_name_1', 'temp_new_name_1', content, src);
				replace('old_name_2', 'temp_new_name_2', content, src);
				return result(src, filename);
			}
		},
		{
			markup: ({ content, filename }) => {
				const src = new MagicString(content);
				replace('temp_new_name_1', 'temp_temp_new_name_1', content, src);
				replace('temp_new_name_2', 'temp_temp_new_name_2', content, src);
				return result(src, filename);
			}
		},
		{
			markup: ({ content, filename }) => {
				const src = new MagicString(content);
				replace('temp_temp_new_name_1', 'new_name_1', content, src);
				replace('temp_temp_new_name_2', 'new_name_2', content, src);
				return result(src, filename);
			}
		}
	]
};
