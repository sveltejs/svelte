// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Hoist_unmodified_var($$payload, $$props) {
	$.push(true);

	let boolean = false;

	$$payload.out += `<p${$.attr("contenteditable", boolean, false)}>hello world</p>`;
	$.pop();
}
