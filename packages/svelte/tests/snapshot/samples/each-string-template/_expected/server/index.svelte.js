import * as $ from 'svelte/internal/server';

export default function Each_string_template($$payload) {
	$$payload.push(`<!--[-->`);

	const each_array = $.ensure_array_like(['foo', 'bar', 'baz']);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];

		$$payload.push(`<!---->${$.escape(thing)}, `);
	}

	$$payload.push(`<!--]-->`);
}