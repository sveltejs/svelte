// input.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

function log(_, snippet) {
	console.log(snippet);
}

var frag_1 = $.template(`Hello`, true);
var frag = $.template(`<button>log snippet</button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, false);

	/* Init */
	var button = $.open($$anchor, true, frag);

	function snippet($$anchor) {
		/* Init */
		var fragment = $.open_frag($$anchor, true, frag_1);

		$.close_frag($$anchor, fragment);
	}

	button.__click = [log, snippet];
	$.close($$anchor, button);
	$.pop();
}

$.delegate(["click"]);