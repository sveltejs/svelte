// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

function reset(_, str, tpl) {
	$.set(str, '');
	$.set(str, ``);
	$.set(tpl, '');
	$.set(tpl, ``);
}

var frag = $.template(`<input> <input> <button>reset</button>`, true);

export default function State_proxy_literal($$anchor, $$props) {
	$.push($$props, true);

	let str = $.source('');
	let tpl = $.source(``);
	var fragment = $.open_frag($$anchor, frag);
	var input = $.first_child(fragment);

	$.remove_input_attr_defaults(input);

	var input_1 = $.sibling($.sibling(input, true));

	$.remove_input_attr_defaults(input_1);

	var button = $.sibling($.sibling(input_1, true));

	$.bind_value(input, () => $.get(str), ($$value) => $.set(str, $$value));
	$.bind_value(input_1, () => $.get(tpl), ($$value) => $.set(tpl, $$value));
	button.__click = [reset, str, tpl];
	$.close_frag($$anchor, fragment);
	$.pop();
}

$.delegate(["click"]);