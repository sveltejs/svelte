// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Svelte_element($$payload, $$props) {
	$.push(true);

	let { tag = 'hr' } = $$props;
	const anchor = $.create_anchor($$payload);

	$$payload.out += `${anchor}`;
	if (tag) $.element($$payload, tag, () => {}, () => {});
	$$payload.out += `${anchor}`;
	$.bind_props($$props, { tag });
	$.pop();
}