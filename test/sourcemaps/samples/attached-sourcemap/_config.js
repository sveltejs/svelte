import MagicString from 'magic-string';

let indent_size = 4;
let comment_multi = true;

// TODO
// Using magic-string's own .toUrl() method results in mysterious runtime failures.
// If tests are being run in `PUBLISH=true` mode AND at least one runtime test has been run prior to this test, then magic-string's btoa implementation fails with window not being declared. This is despite it previously checking that window.btoa is available. Presumably there's some sort of context thing going on, either with JSDOM or with Node itself.
// The tests pass when they're not run with `PUBLISH=true` (meaning, they currently pass in CI), and they also pass if you skip all runtime tests.
// I've spent too much time on this already, so for now to unblock the release, I am using the following workaround, which manually serializes the sourcemaps using Node Buffer APIs.
function toUrl(map) {
	return 'data:application/json;charset=utf-8;base64,' + Buffer.from(map.toString(), 'utf-8').toString('base64');
}

function get_processor(tag_name, search, replace) {
	return {
		[tag_name]: ({ content, filename }) => {
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
			const attach_line = (tag_name == 'style' || comment_multi)
				? `\n/*# sourceMappingURL=${toUrl(map)} */`
				: `\n//# sourceMappingURL=${toUrl(map)}` // only in script
			;
			code = ms.toString() + attach_line;

			indent_size += 2;
			if (tag_name == 'script') comment_multi = !comment_multi;
			return { code };
		}
	};
}

export default {
	preprocess: [

		get_processor('script', 'replace_me_script', 'done_replace_script_1'),
		get_processor('script', 'done_replace_script_1', 'done_replace_script_2'),

		get_processor('style', '.replace_me_style', '.done_replace_style_1'),
		get_processor('style', '.done_replace_style_1', '.done_replace_style_2')

	]
};
