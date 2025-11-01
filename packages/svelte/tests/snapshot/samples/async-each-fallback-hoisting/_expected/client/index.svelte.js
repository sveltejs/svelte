import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_each_fallback_hoisting($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.async(node, [], [() => Promise.resolve([])], (node, $$collection) => {
		$.each(
			node,
			16,
			() => $.get($$collection),
			$.index,
			($$anchor, item) => {
				$.next();

				var text = $.text();

				$.template_effect(($0) => $.set_text(text, $0), void 0, [() => Promise.reject('This should never be reached')]);
				$.append($$anchor, text);
			},
			($$anchor) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(($0) => $.set_text(text_1, $0), void 0, [() => Promise.resolve(4)]);
				$.append($$anchor, text_1);
			}
		);
	});

	$.append($$anchor, fragment);
}