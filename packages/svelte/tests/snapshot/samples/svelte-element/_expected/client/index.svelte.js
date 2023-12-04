// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Svelte_element($$anchor, $$props) {
	$.push($$props, true);

	let tag = $.prop_source($$props, "tag", true, 'hr');
	/* Init */
	var fragment = $.comment($$anchor);
	var node = $.child_frag(fragment);

	$.element(node, () => $.get(tag));
	$.close_frag($$anchor, fragment);
	$.pop();
}
