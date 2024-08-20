import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<p></p> <p></p> <!>`, 1);

export default function Purity($$anchor) {
	let min = 0;
	let max = 100;
	let number = 50;
	let value = 'hello';
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = Math.max(min, Math.min(max, number));

	var p_1 = $.sibling($.sibling(p));

	p_1.textContent = location.href;

	var node = $.sibling($.sibling(p_1));

	Child(node, { prop: encodeURIComponent(value) });
	$.append($$anchor, fragment);
}