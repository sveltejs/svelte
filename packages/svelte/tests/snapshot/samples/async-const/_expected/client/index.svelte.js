import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root_1 = $.from_html(`<p> </p>`);

export default function Async_const($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			let a;
			let b;

			var promises = $.run([
				async () => a = (await $.save($.async_derived(async () => (await $.save(1))())))(),
				() => b = $.derived(() => $.get(a) + 1)
			]);

			var p = root_1();
			var text = $.child(p, true);

			$.reset(p);
			$.template_effect(() => $.set_text(text, $.get(b)), void 0, void 0, [promises[1]]);
			$.append($$anchor, p);
		};

		var d = $.derived(() => true);

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent, 0);
		});
	}

	$.append($$anchor, fragment);
}