import MagicString from 'magic-string';

// TODO move util fns to test index.js

function result(filename, src, options = {}) {
	const map_fn = options.encodeMappings ? src.generateMap : src.generateDecodedMap;
	delete options.encodeMappings;
	return {
		code: src.toString(),
		map: map_fn.apply(src, [{
			source: filename,
			hires: true,
			includeContent: false,
			...options
		}])
	};
}

function replace_all(src, search, replace) {
	let idx = src.original.indexOf(search);
	if (idx == -1) throw new Error('search not found in src');
	do {
		src.overwrite(idx, idx + search.length, replace);
	} while ((idx = src.original.indexOf(search, idx + 1)) != -1);
}

export default {

	js_map_sources: [], // test component has no scripts

	preprocess: [
		// preprocessor 0
		{ markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace_all(src, 'replace_me', 'version_1');
			return result(filename, src, { encodeMappings: true });
		} },
		// 1
		{ markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace_all(src, 'version_1', 'version_2');
			return result(filename, src);
		} },
		// 2
		{ markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace_all(src, 'version_2', 'version_3');
			return result(filename, src, { encodeMappings: true });
		} },
		// 3
		{ markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace_all(src, 'version_3', 'version_4');
			return result(filename, src);
		} }
	]

};
