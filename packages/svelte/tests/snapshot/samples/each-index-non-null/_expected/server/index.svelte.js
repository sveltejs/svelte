import * as $ from 'svelte/internal/server';

export default function Each_index_non_null($$payload) {
	const each_array = $.ensure_array_like(Array(10));

	$$payload.out.push(`<!--[-->`);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		$$payload.out.push(`<p>index: ${$.escape(i)}</p>`);
	}

	$$payload.out.push(`<!--]-->`);
}