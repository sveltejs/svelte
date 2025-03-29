import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.template_fn(() => {
	var h1 = document.createElement('h1');
	var text = document.createTextNode('hello world');

	h1.insertBefore(text, undefined)

	var fragment = document.createDocumentFragment();

	fragment.append(h1)
	return fragment;
});

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