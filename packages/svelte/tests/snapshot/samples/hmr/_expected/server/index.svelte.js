// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Hmr($$payload, $$props) {
	$.push(false);
	$$payload.out += `<h1>hello world</h1>`;
	$.pop();
}