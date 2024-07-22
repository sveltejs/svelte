import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

if (import.meta.hot) {
	const $$hmr = $.hmr(Hmr);

	Hmr = $$hmr.wrapper;

	import.meta.hot.accept((module) => {
		$$hmr.update(module.default);
	});
}

export default Hmr;