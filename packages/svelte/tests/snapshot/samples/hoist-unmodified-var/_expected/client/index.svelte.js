// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

const count = 0;
var frag = $.template(`<p> </p>`);

export default function Hoist_unmodified_var($$anchor, $$props) {
	$.push($$props, true);

	/* Init */
	var p = $.open($$anchor, true, frag);
	var text = $.child(p);

	text.nodeValue = $.stringify(count);
	$.close($$anchor, p);
	$.pop();
}
