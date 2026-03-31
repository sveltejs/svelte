import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_top_level_group_sync_run($$anchor) {
	var a,
		// these should be grouped into one, having an async tick inbetween
		// would change how the code runs and could introduce subtle timing bugs
		b,
		c;

	var $$promises = $.run([
		async () => a = await Promise.resolve(1),
		() => {
			b = a + 1;
			c = b + 1;
		}
	]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, c), void 0, void 0, [$$promises[1]]);
	$.append($$anchor, text);
}