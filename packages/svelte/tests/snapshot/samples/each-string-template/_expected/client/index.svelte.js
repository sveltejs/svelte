// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Each_string_template($$anchor, $$props) {
	$.push($$props, false);

	/* Init */
	var fragment = $.comment($$anchor);
	var node = $.child_frag(fragment);

	$.each_indexed(
		node,
		() => ['foo', 'bar', 'baz'],
		1,
		($$anchor, thing, $$index) => {
			/* Init */
			var node_1 = $.space($$anchor);

			/* Update */
			$.text_effect(node_1, () => `${$.stringify($.unwrap(thing))}, `);
			$.close($$anchor, node_1);
		},
		null
	);

	$.close_frag($$anchor, fragment);
	$.pop();
}