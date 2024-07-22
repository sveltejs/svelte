import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

if (import.meta.hot) {
	import.meta.hot.data.source ??= $.source(Hmr);

	const $$filename = Hmr[$.FILENAME];
	const $$original = Hmr;

	Hmr = $.hmr(import.meta.hot.data.source);
	Hmr[$.FILENAME] = $$filename;
	Hmr[$.ORIGINAL] = $$original;

	import.meta.hot.accept((module) => {
		$.set(import.meta.hot.data.source, module.default[$.ORIGINAL]);
	});
}

export default Hmr;