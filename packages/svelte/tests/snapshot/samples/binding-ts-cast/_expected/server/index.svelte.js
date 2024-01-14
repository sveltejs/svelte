// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Binding_ts_cast($$payload, $$props) {
	$.push(true);

	// issue #10179 - binding with type cast
	let element = null;
	let with_state = { foo: 1 };
	let without_state = { foo: 2 };
	let non_null_assertion = null;

	$$payload.out += `<div>${$.escape_text(JSON.stringify({ a: with_state, b: without_state }))}</div> <input type="number"${$.attr("value", with_state.foo, false)}> <input type="number"${$.attr("value", without_state.foo, false)}> <input type="number"${$.attr("value", non_null_assertion, false)}> <button>Update</button>`;
	$.pop();
}