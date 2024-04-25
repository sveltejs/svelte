import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

if (import.meta.hot) {
	const s = $.source(Hmr);

	Hmr = $.hmr(s);

	import.meta.hot.accept((module) => {
		$.set(s, module.default);
	});
}

export default Hmr;