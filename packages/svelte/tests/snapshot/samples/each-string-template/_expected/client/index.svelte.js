// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

function Each_string_template($$anchor, $$props) {
	$.push($$props, false);
	$.init();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 1, () => ['foo', 'bar', 'baz'], $.index, ($$anchor, thing, $$index) => {
		var text = $.text($$anchor);

		$.render_effect(() => $.set_text(text, `${$.stringify($.unwrap(thing))}, `));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
	$.pop();
}

export default Each_string_template;