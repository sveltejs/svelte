import * as $ from 'svelte/internal/server';

export default function Svelte_element($$payload, $$props) {
	const $$cleanup = $.setup($$payload);
	let { tag = 'hr' } = $$props;

	$.element($$payload, tag);
	$$cleanup($$payload);
}