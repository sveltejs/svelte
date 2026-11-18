import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Each_empty_fallback($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.items, $.index, ($$anchor, item) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(item)));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => $$props.items, (item) => item, ($$anchor, item) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1, true);

		$.template_effect(() => $.set_text(text_1, item));
		$.append($$anchor, p_1);
	});

	$.append($$anchor, fragment);
}