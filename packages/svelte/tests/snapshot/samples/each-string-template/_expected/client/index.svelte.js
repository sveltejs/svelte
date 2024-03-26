// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Each_string_template($$anchor, $$props) {
	$.push($$props, false);
	$.init();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each_indexed(node, 1, () => ['foo', 'bar', 'baz'], ($$anchor, thing, $$index) => {
		var text = $.text($$anchor);

		$.render_effect(() => $.set_text(text, `${$.stringify($.unwrap(thing))}, `));
		return $.close($$anchor, text);
	});

	$.close_frag($$anchor, fragment);
	$.pop();
}