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

export default function Hello_world($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}