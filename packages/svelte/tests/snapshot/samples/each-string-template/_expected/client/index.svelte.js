import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Each_string_template($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 0, () => ['foo', 'bar', 'baz'], $.index, ($$anchor, thing) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, `${thing ?? ""}, `));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}