import * as $ from 'svelte/internal/server';

export default function Delegated_locally_declared_shadowed($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like({ length: 1 });

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		$$renderer.push(`<button type="button"${$.attr('data-index', index)}>B</button>`);
	}

	$$renderer.push(`<!--]-->`);
}