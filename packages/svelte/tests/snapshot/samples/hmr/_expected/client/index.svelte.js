import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

if (import.meta.hot) {
	Hmr = $.hmr(Hmr, () => Hmr[$.HMR].source);

	import.meta.hot.accept((module) => {
		module.default[$.HMR].source = Hmr[$.HMR].source;
		$.set(Hmr[$.HMR].source, module.default[$.HMR].original);
	});
}

export default Hmr;