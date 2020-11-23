import MagicString from 'magic-string';

export function magic_string_preprocessor_result(filename: string, src: MagicString) {
	return {
		code: src.toString(),
		map: src.generateMap({
			source: filename,
			hires: true,
			includeContent: false
		})
	};
}

export function magic_string_replace_all(src: MagicString, search: string, replace: string) {
	let idx = src.original.indexOf(search);
	if (idx == -1) throw new Error('search not found in src');
	do {
		src.overwrite(idx, idx + search.length, replace, { storeName: true });
	} while ((idx = src.original.indexOf(search, idx + 1)) != -1);
}
