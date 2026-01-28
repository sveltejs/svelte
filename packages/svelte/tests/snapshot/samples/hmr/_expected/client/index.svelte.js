import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello world</h1>`);

function Hmr($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

if (import.meta.hot) {
	Hmr = $.hmr(Hmr);

	import.meta.hot.accept((module) => {
		Hmr[$.HMR].update(module.default);
	});
}

export default Hmr;