import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_if_alternate_hoisting($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.async(node, [], [() => Promise.resolve(false)], (node, $$condition) => {
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), void 0, [() => Promise.reject('no no no')]);
			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, $0), void 0, [() => Promise.resolve('yes yes yes')]);
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get($$condition)) $$render(consequent); else $$render(alternate, false);
		});
	});

	$.append($$anchor, fragment);
}