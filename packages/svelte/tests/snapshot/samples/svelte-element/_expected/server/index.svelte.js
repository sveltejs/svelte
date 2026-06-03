import * as $ from 'svelte/internal/server';

export default function Svelte_element($$renderer, $$props) {
	let { tag = 'hr' } = $$props;

	$.element($$renderer, tag);
}