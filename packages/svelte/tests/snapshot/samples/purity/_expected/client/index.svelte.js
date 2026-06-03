import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <p></p> <!>`, 1);

export default function Purity($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = '0';

	var p_1 = $.sibling(p, 2);

	p_1.textContent = location.href;

	var node = $.sibling(p_1, 2);

	Child(node, { prop: encodeURIComponent('hello') });
	$.append($$anchor, fragment);
}