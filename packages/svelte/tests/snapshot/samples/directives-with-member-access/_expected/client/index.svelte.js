// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

var frag = $.template(`<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>`, true);

export default function Directives_with_member_access($$anchor, $$props) {
	$.push($$props, false);

	const one = () => {};
	const nested = { one, "with-string": one };
	const evenmore = { nested };

	/* Init */
	var fragment = $.open_frag($$anchor, true, frag);
	var div = $.child_frag(fragment);
	var div_1 = $.sibling($.sibling(div));
	var div_2 = $.sibling($.sibling(div_1));
	var div_3 = $.sibling($.sibling(div_2));

	$.transition(div_3, one, null, false);

	var div_4 = $.sibling($.sibling(div_3));

	$.transition(div_4, nested['one'], null, false);

	var div_5 = $.sibling($.sibling(div_4));

	$.transition(div_5, evenmore['nested']['one'], null, false);

	var div_6 = $.sibling($.sibling(div_5));

	$.animate(div_6, one, null);

	var div_7 = $.sibling($.sibling(div_6));

	$.animate(div_7, nested['one'], null);

	var div_8 = $.sibling($.sibling(div_7));

	$.animate(div_8, evenmore['nested']['one'], null);

	var div_9 = $.sibling($.sibling(div_8));

	$.in(div_9, one, null, false);

	var div_10 = $.sibling($.sibling(div_9));

	$.in(div_10, nested['one'], null, false);

	var div_11 = $.sibling($.sibling(div_10));

	$.in(div_11, evenmore['nested']['one'], null, false);

	var div_12 = $.sibling($.sibling(div_11));

	$.out(div_12, one, null, false);

	var div_13 = $.sibling($.sibling(div_12));

	$.out(div_13, nested['one'], null, false);

	var div_14 = $.sibling($.sibling(div_13));

	$.out(div_14, evenmore['nested']['one'], null, false);

	var div_15 = $.sibling($.sibling(div_14));
	var div_16 = $.sibling($.sibling(div_15));
	var div_17 = $.sibling($.sibling(div_16));

	$.transition(div_17, nested['with-string'], null, false);

	var div_18 = $.sibling($.sibling(div_17));

	$.transition(div_18, evenmore['nested']['with-string'], null, false);

	var div_19 = $.sibling($.sibling(div_18));

	$.animate(div_19, nested['with-string'], null);

	var div_20 = $.sibling($.sibling(div_19));

	$.animate(div_20, evenmore['nested']['with-string'], null);

	var div_21 = $.sibling($.sibling(div_20));

	$.in(div_21, nested['with-string'], null, false);

	var div_22 = $.sibling($.sibling(div_21));

	$.in(div_22, evenmore['nested']['with-string'], null, false);

	var div_23 = $.sibling($.sibling(div_22));

	$.out(div_23, nested['with-string'], null, false);

	var div_24 = $.sibling($.sibling(div_23));

	$.out(div_24, evenmore['nested']['with-string'], null, false);
	$.action(div, $$node => one($$node));
	$.action(div_1, $$node => nested['one']($$node));
	$.action(div_2, $$node => evenmore['nested']['one']($$node));
	$.action(div_15, $$node => nested['with-string']($$node));
	$.action(div_16, $$node => evenmore['nested']['with-string']($$node));
	$.close_frag($$anchor, fragment);
	$.pop();
}