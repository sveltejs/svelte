// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Each_string_template($$payload, $$props) {
	$.push(false);

	const each_array = $.ensure_array_like(['foo', 'bar', 'baz']);

	$$payload.out += `<!--[-->`;

	for (let $$index = 0; $$index < each_array.length; $$index++) {
		const thing = each_array[$$index];

		$$payload.out += "<!--[-->";
		$$payload.out += `${$.escape(thing)}, `;
		$$payload.out += "<!--]-->";
	}

	$$payload.out += `<!--]-->`;
	$.pop();
}