// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

function reset(_, str, tpl) {
	$.set(str, '');
	$.set(str, ``);
	$.set(tpl, '');
	$.set(tpl, ``);
}

var root = $.template(`<input> <input> <button>reset</button>`, 1);

function State_proxy_literal($$anchor, $$props) {
	$.push($$props, true);

	let str = $.source('');
	let tpl = $.source(``);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_attr_defaults(input);

	var input_1 = $.sibling($.sibling(input, true));

	$.remove_input_attr_defaults(input_1);

	var button = $.sibling($.sibling(input_1, true));

	button.__click = [reset, str, tpl];
	$.bind_value(input, () => $.get(str), ($$value) => $.set(str, $$value));
	$.bind_value(input_1, () => $.get(tpl), ($$value) => $.set(tpl, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

export default State_proxy_literal;

$.delegate(["click"]);