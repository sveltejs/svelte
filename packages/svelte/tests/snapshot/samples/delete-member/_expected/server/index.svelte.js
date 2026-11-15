import * as $ from 'svelte/internal/server';

export default function Delete_member($$renderer) {
	const items = [0, 1, 2];

	$$renderer.push(`<button>${$.escape(items.length)}</button>`);
}