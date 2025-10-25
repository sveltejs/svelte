import * as $ from 'svelte/internal/server';

export default function Svelte_element($$renderer, $$props) {
	var { tag = 'hr' } = $$props;

	$.element($$renderer, tag);
}