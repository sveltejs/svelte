import * as $ from 'svelte/internal/server';

export default function A($$renderer, $$props) {
	let { item } = $$props;

	$$renderer.push(`<span>${$.escape(item)}</span>`);
}