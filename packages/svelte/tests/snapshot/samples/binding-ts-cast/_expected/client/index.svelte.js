// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

var frag = $.template(`<div> </div> <input type="number"> <input type="number"> <input type="number">`, true);

export default function Binding_ts_cast($$anchor, $$props) {
	$.push($$props, true);

	// issue #10179 - binding with type cast
	let element = null;
	let with_state = $.proxy({ foo: 1 });
	let without_state = { foo: 2 };
	let non_null_assertion = null;
	/* Init */
	var fragment = $.open_frag($$anchor, true, frag);
	var node = $.child_frag(fragment);

	$.bind_this(node, ($$value) => element = $$value);

	var text = $.child(node);
	var input = $.sibling($.sibling(node));

	$.remove_input_attr_defaults(input);

	var input_1 = $.sibling($.sibling(input));

	$.remove_input_attr_defaults(input_1);

	var input_2 = $.sibling($.sibling(input_1));

	$.remove_input_attr_defaults(input_2);

	/* Update */
	$.text_effect(text, () => JSON.stringify({
		with_state,
		without_state,
		non_null_assertion
	}));

	$.bind_value(input, () => with_state.foo, ($$value) => with_state.foo = $$value);
	$.bind_value(input_1, () => without_state.foo, ($$value) => without_state.foo = $$value);
	$.bind_value(input_2, () => non_null_assertion, ($$value) => non_null_assertion = $$value);
	$.close_frag($$anchor, fragment);
	$.pop();
}