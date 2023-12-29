// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";

const autocapitalize = 'words';

import * as $ from "svelte/internal";

const boolean = false;
var frag = $.template(`<p autocapitalize="${autocapitalize}" contenteditable="${boolean}">hello world</p>`);

export default function Hoist_unmodified_var($$anchor, $$props) {
	$.push($$props, true);

	/* Init */
	var p = $.open($$anchor, true, frag);

	$.close($$anchor, p);
	$.pop();
}
