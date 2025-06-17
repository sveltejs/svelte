import 'svelte/internal/disclose-version';

Using_top_level[$.FILENAME] = 'packages/svelte/tests/snapshot/samples/using-top-level/index.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.from_html(`<p> </p>`), Using_top_level[$.FILENAME], [[12, 0]]);

export default function Using_top_level($$anchor, $$props) {
	$.check_target(new.target);

	var x;

	try {
		$.push($$props, true, Using_top_level);

		x = $.disposable({
			message: $$props.message,
			[Symbol.dispose]() {
				console.log(...$.log_if_contains_state('log', `disposing ${$$props.message}`));
			}
		})

		var p = root();
		var text = $.child(p, true);

		$.reset(p);
		$.template_effect(() => $.set_text(text, x.message));
		$.append($$anchor, p);
		return $.pop({ ...$.legacy_api() });
	} finally {
		$.dispose(x);
	}
}