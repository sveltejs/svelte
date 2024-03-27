// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Svelte_element($$anchor, $$props) {
	$.push($$props, true);

	let tag = $.prop($$props, "tag", 3, 'hr');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, tag, false);
	$.append($$anchor, fragment);
	$.pop();
}