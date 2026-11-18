import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

var root_1 = $.from_html(
	`

<!>

<!>`,
	1
);

export default function Each_empty_fallback_preserved($$anchor, $$props) {
	$.next();

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment));

	$.each(
		node,
		17,
		() => $$props.items,
		$.index,
		($$anchor, item) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(item)));
			$.append($$anchor, p);
		},
		($$anchor) => {
			$.next();

			var text_1 = $.text(' ');

			$.append($$anchor, text_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.each(
		node_1,
		16,
		() => $$props.items,
		(item) => item,
		($$anchor, item) => {
			var p_1 = root();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, item));
			$.append($$anchor, p_1);
		},
		($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.append($$anchor, fragment_1);
		}
	);

	$.append($$anchor, fragment);
}