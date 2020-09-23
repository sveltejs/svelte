import MagicString from 'magic-string';

function replace(search, replace, content, src, options = {}) {
	let idx = -1;
	while ((idx = content.indexOf(search, idx + 1)) != -1) {
		src.overwrite(idx, idx + search.length, replace, options);
	}
}

function result(src, filename) {
	return {
		code: src.toString(),
		map: src.generateDecodedMap({ // return decoded sourcemap
			source: filename,
			hires: true,
			includeContent: false
		})
	};
}

export default {
	preprocess: {
		markup: ({ content, filename }) => {
			const src = new MagicString(content);
			replace('replace me', 'success', content, src);
			return result(src, filename);
		}
	}
};
