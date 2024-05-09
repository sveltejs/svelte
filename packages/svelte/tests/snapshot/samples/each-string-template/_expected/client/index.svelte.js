import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Each_string_template($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 1, () => ['foo', 'bar', 'baz'], $.index, ($$anchor, thing, $$index) => {
		var text = $.text($$anchor);

		$.template_effect(() => $.set_text(text, `${$.stringify($.unwrap(thing))}, `));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}