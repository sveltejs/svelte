import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
	return {};
}

if (import.meta.hot) {
	const s = $.source(Hmr);
	const filename = Hmr.filename;

	Hmr = $.hmr(s);
	Hmr.filename = filename;

	if (import.meta.hot.acceptExports) {
		import.meta.hot.acceptExports(["default"], (module) => {
			$.set(s, module.default);
		});
	} else {
		import.meta.hot.accept((module) => {
			$.set(s, module.default);
		});
	}
}

export default Hmr;