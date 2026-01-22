import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root_1 = $.from_html(`<p> </p>`);

export default function Async_blockers($$anchor) {
	var a, b;
	var $$promises = $.run([() => 1, () => a = 1, () => b = $.derived(() => a)]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var text = $.child(p, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, '1'), void 0, void 0, [$$promises[1]]);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}