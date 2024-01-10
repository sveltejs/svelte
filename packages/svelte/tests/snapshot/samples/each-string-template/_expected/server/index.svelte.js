// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Each_string_template($$payload, $$props) {
	$.push(false);

	const anchor = $.create_anchor($$payload);
	const each_array = $.ensure_array_like(['foo', 'bar', 'baz']);

	$$payload.out += `${anchor}`;

	for (let $$index = 0; $$index < each_array.length; $$index++) {
		const thing = each_array[$$index];
		const anchor_1 = $.create_anchor($$payload);

		$$payload.out += `${anchor_1}${$.escape(thing)}, ${anchor_1}`;
	}

	$$payload.out += `${anchor}`;
	$.pop();
}