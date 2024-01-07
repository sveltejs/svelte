// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";

const o = 'o';
const d = 'd';
const url = new URL('foobar.png', 'https://www.example.com/').href;

import * as $ from "svelte/internal";

const boolean = false;
var frag = $.template(`<p autocapitalize="${`w${$.stringify(o)}r${$.stringify(d)}s`}" contenteditable="${boolean}">boolean is ${$.stringify(boolean)} and autocapitalize is w${$.stringify(o)}r${$.stringify(d)}s</p> <img src="${url}" alt="example">`, true);

export default function Hoist_unmodified_var($$anchor, $$props) {
	$.push($$props, true);

	let value = 'd';

	value += 'd';

	/* Init */
	var fragment = $.open_frag($$anchor, true, frag);
	var node = $.child_frag(fragment);

	$.attr(node, "itemid", `w${$.stringify(o)}r${$.stringify(value)}s`);

	var text = $.child(node);
	var img = $.sibling($.sibling(node));

	$.close_frag($$anchor, fragment);
	$.pop();
}
