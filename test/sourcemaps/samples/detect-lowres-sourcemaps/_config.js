import MagicString from 'magic-string';

// TODO move util fns to test index.js

function result(filename, src, extraOptions = {}) {
	return {
		code: src.toString(),
		map: src.generateDecodedMap({
			source: filename,
			hires: true,
			includeContent: false,
			...extraOptions
		})
	};
}

function replace_all(src, search, replace) {
	let idx = src.original.indexOf(search);
	if (idx == -1) throw new Error('search not found in src');
	do {
		src.overwrite(idx, idx + search.length, replace);
	} while ((idx = src.original.indexOf(search, idx + 1)) != -1);
}

function replace_first(src, search, replace) {
	const idx = src.original.indexOf(search);
	if (idx == -1) throw new Error('search not found in src');
	src.overwrite(idx, idx + search.length, replace);
}

export default {

	preprocess_options: {
		sourcemapLossWarn: 0.9 // warn often
	},

	js_map_sources: [], // test component has no scripts

	preprocess: [
		{ markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace_all(src, 'replace_me', 'done_replace');
			return result(filename, src, { hires: true });
		} },
		{ markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace_first(src, 'done_replace', 'version_3');
			// return low-resolution sourcemap
			// this should make previous mappings unreachable
			return result(filename, src, { hires: false });
		} }
	]

};
