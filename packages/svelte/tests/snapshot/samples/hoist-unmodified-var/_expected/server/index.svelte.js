// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Hoist_unmodified_var($$payload, $$props) {
	$.push(true);

	let count = 0;

	$$payload.out += `<p>${$.escape_text(count)}</p>`;
	$.pop();
}
