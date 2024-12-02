import * as $ from "svelte/internal/server";

export default function Svelte_element($$payload, $$props) {
	let { tag = 'hr' } = $$props;

	$.element($$payload, tag);
}