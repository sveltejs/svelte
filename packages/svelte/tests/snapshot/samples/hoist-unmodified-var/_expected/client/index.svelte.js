// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";

const autocapitalize = 'words';

import * as $ from "svelte/internal";

const boolean = false;
var frag = $.template(`<p autocapitalize="${autocapitalize}" contenteditable="${boolean}"> </p>`);

export default function Hoist_unmodified_var($$anchor, $$props) {
	$.push($$props, true);

	/* Init */
	var p = $.open($$anchor, true, frag);
	var text = $.child(p);

	text.nodeValue = `boolean is ${$.stringify(boolean)} and autocapitalize is $${$.stringify(autocapitalize)}`;
	$.close($$anchor, p);
	$.pop();
}