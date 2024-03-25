// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Each_string_template($$anchor, $$props) {
	$.push($$props, false);
	$.init();

	var fragment = $.comment($$anchor);
	var node = $.first_child(fragment);

	$.each_indexed(
		node,
		() => ['foo', 'bar', 'baz'],
		1,
		($$anchor, thing, $$index) => {
			var text = $.space_frag($$anchor);

			$.text_effect(text, () => `${$.stringify($.unwrap(thing))}, `);
			return $.close($$anchor, text);
		},
		null
	);

	$.close_frag($$anchor, fragment);
	$.pop();
}