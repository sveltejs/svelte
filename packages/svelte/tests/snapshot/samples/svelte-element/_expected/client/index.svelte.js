import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Svelte_element($$anchor, $$props) {
	let tag = $.prop($$props, "tag", 3, 'hr');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, tag, false);
	$.append($$anchor, fragment);
	return {};
}