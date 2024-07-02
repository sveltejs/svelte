import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<!>`, 1);

export default function Svelte_element($$anchor, $$props) {
	let tag = $.prop($$props, "tag", 3, 'hr');
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, tag, false);
	$.append($$anchor, fragment);
}