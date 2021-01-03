import MagicString from 'magic-string';

let indent_size = 4;
function get_processor(search, replace) {
	return ({ content, filename }) => {
		let code = content.slice();
		const ms = new MagicString(code);

		const idx = ms.original.indexOf(search);
		if (idx == -1) throw new Error('search not found in src');
		ms.overwrite(idx, idx + search.length, replace, { storeName: true });

		// change line + column
		const indent = Array.from({ length: indent_size }).join(' ');
		ms.prependLeft(idx, '\n'+indent);

		const map_opts = { source: filename, hires: true, includeContent: false };
		const map = ms.generateMap(map_opts);
		const attach_line = `\n/*# sourceMappingURL=${map.toUrl()} */`;
		code = ms.toString() + attach_line;

		indent_size += 2;
		return { code };
	};
}

export default {
	preprocess: [

		{ script: get_processor('replace_me_script', 'done_replace_script_1') },
		{ script: get_processor('done_replace_script_1', 'done_replace_script_2') },

		{ style: get_processor('.replace_me_style', '.done_replace_style_1') },
		{ style: get_processor('.done_replace_style_1', '.done_replace_style_2') }

	]
};
