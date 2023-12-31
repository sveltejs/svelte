// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";

const o = 'o';
const d = 'd';

import * as $ from "svelte/internal";

const boolean = false;
var frag = $.template(`<p autocapitalize="${`w${$.stringify(o)}r${$.stringify(d)}s`}" contenteditable="${boolean}"> </p>`);

export default function Hoist_unmodified_var($$anchor, $$props) {
	$.push($$props, true);

	let value = 'd';

	value += 'd';

	/* Init */
	var p = $.open($$anchor, true, frag);

	$.attr(p, "itemid", `w${$.stringify(o)}r${$.stringify(value)}s`);

	var text = $.child(p);

	text.nodeValue = `boolean is ${$.stringify(boolean)} and autocapitalize is w${$.stringify(o)}r${$.stringify(d)}s`;
	$.close($$anchor, p);
	$.pop();
}