import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

function reset(_, str, tpl) {
	$.set(str, '');
	$.set(str, ``);
	$.set(tpl, '');
	$.set(tpl, ``);
}

var root = $.template(`<input> <input> <button>reset</button>`, 1);

export default function State_proxy_literal($$anchor) {
	let str = $.source('');
	let tpl = $.source(``);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var button = $.sibling(input_1, 2);

	button.__click = [reset, str, tpl];
	$.bind_value(input, () => $.get(str), ($$value) => $.set(str, $$value));
	$.bind_value(input_1, () => $.get(tpl), ($$value) => $.set(tpl, $$value));
	$.append($$anchor, fragment);
}

$.delegate(["click"]);