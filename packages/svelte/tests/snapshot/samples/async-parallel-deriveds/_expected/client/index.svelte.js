import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_parallel_deriveds($$anchor) {
	// independent of each other, so they are created in parallel
	// reads `a` directly, so it has to wait for the previous group
	// reads `c` indirectly via `get_c`, so it has to wait for `c`...
	// ...and this one is independent of `d`, so it's created in parallel with it
	// a regular top-level `await` in between means it has to wait
	function get_c() {
		return $.get(c);
	}

	var a, b, c, d, e, f;

	var $$promises = $.run([
		async () => {
			var a_promise = $.async_derived(() => foo());
			var promise = $.async_derived(() => bar());

			a = await a_promise;

			var $$d = await promise;

			b = $.derived(() => $.get($$d).b);
		},
		async () => c = await $.async_derived(() => bar($.get(a))),
		async () => {
			var d_promise = $.async_derived(() => get_c());
			var e_promise = $.async_derived(() => foo());

			d = await d_promise;
			e = await e_promise;
		},
		baz,
		async () => f = await $.async_derived(() => foo())
	]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} ${$.get(b) ?? ''} ${$.get(c) ?? ''} ${$.get(d) ?? ''} ${$.get(e) ?? ''} ${$.get(f) ?? ''}`), void 0, void 0, [$$promises[2], $$promises[0], $$promises[4]]);
	$.append($$anchor, text);
}