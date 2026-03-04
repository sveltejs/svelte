import * as $ from 'svelte/internal/server';

export default function Each_string_template($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(['foo', 'bar', 'baz']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(thing)}, `);
	}

	$$renderer.push(`<!--]-->`);
}