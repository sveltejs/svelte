import * as $ from 'svelte/internal/server';

export default function Delegated_locally_declared_shadowed($$payload) {
	$$payload.push(`<!--[-->`);

	const each_array = $.ensure_array_like({ length: 1 });

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		$$payload.push(`<button type="button"${$.attr('data-index', index)}>B</button>`);
	}

	$$payload.push(`<!--]-->`);
}