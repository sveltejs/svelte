// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Svelte_element($$payload, $$props) {
	$.push(true);

	let { tag = 'hr' } = $$props;

	$$payload.out += `<!--[-->`;
	if (tag) $.element($$payload, tag, () => {}, () => {});
	$$payload.out += `<!--]-->`;
	$.pop();
}