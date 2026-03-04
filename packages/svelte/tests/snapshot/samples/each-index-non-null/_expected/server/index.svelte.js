import * as $ from 'svelte/internal/server';

export default function Each_index_non_null($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(Array(10));

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		$$renderer.push(`<p>index: ${$.escape(i)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}