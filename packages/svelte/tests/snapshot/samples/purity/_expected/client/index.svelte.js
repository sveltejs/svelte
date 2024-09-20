import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<p></p> <p></p> <!>`, 1);

export default function Purity($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = Math.max(0, Math.min(0, 100));

	var p_1 = $.sibling(p, 2);

	p_1.textContent = location.href;

	var node = $.sibling(p_1, 2);

	Child(node, { prop: encodeURIComponent('hello') });
	$.append($$anchor, fragment);
}