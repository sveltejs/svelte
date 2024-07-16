import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

if (import.meta.hot) {
	const s = $.source(Hmr);
	const filename = Hmr.filename;
	const $$original = Hmr;

	Hmr = $.hmr(s);
	Hmr.filename = filename;
	Hmr[$.ORIGINAL] = $$original;

	import.meta.hot.accept((module) => {
		$.set(s, module.default[$.ORIGINAL]);
	});
}

export default Hmr;