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
	let str = $.state('');
	let tpl = $.state(``);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	$.bind_value(input, () => $.get(str), ($$value) => $.set(str, $$value));

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);
	$.bind_value(input_1, () => $.get(tpl), ($$value) => $.set(tpl, $$value));

	var button = $.sibling(input_1, 2);

	button.__click = [reset, str, tpl];
	$.append($$anchor, fragment);
}

$.delegate(["click"]);