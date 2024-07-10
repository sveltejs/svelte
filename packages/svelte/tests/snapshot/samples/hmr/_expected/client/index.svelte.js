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

	const accept = (module) => {
		$.set(s, module.default);
	};

	Hmr = $.hmr(s);
	Hmr.filename = filename;

	if (import.meta.hot.acceptExports) {
		import.meta.hot.acceptExports(["default"], accept);
	} else {
		import.meta.hot.accept(accept);
	}
}

export default Hmr;