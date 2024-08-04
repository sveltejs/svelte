import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<p> </p> <p> </p> <!>`, 1);

export default function Purity($$anchor) {
	let min = 0;
	let max = 100;
	let number = 50;
	let value = 'hello';
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.child(p);

	text.nodeValue = Math.max(min, Math.min(max, number));
	$.reset(p);

	var p_1 = $.sibling($.sibling(p, true));
	var text_1 = $.child(p_1);

	text_1.nodeValue = location.href;
	$.reset(p_1);

	var node = $.sibling($.sibling(p_1, true));

	Child(node, {
		prop: encodeURIComponent(value),
		$$legacy: true
	});

	$.append($$anchor, fragment);
}