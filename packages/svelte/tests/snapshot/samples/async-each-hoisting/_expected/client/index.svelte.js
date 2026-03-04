import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_each_hoisting($$anchor) {
	const first = Promise.resolve(1);
	const second = Promise.resolve(2);
	const third = Promise.resolve(3);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.async(node, [], [() => Promise.resolve([first, second, third])], (node, $$collection) => {
		$.each(node, 17, () => $.get($$collection), $.index, ($$anchor, item) => {
			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), void 0, [() => $.get(item)]);
			$.append($$anchor, text);
		});
	});

	$.append($$anchor, fragment);
}