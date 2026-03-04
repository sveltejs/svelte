import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Async_top_level_inspect_server($$anchor) {
	var data;
	var $$promises = $.run([async () => data = await Promise.resolve(42),,]);
	var p = root();
	var text = $.child(p, true);

	$.reset(p);
	$.template_effect(() => $.set_text(text, data), void 0, void 0, [$$promises[1]]);
	$.append($$anchor, p);
}