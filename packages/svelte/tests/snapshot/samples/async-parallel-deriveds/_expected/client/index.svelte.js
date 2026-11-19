import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_parallel_deriveds($$anchor) {
	const items = [];

	// independent of each other, so they are created in parallel
	// reads `a` directly, so it is created once `a` has resolved, in parallel with `b`
	// reads `c` indirectly via `get_c`, so it has to wait for `c`...
	// ...whereas this one is independent of everything before it, so it's created right away
	// a regular top-level `await` can't be skipped, so this has to wait
	// reads `items`, which `g`'s expression might modify, so `g` can't be created before it
	function get_c() {
		return $.get(c);
	}

	var a,
		b,
		c,
		d,
		e,
		f,
		count,
		g,
		promise,
		c_promise,
		e_promise;

	var $$promises = $.run([
		async () => {
			var a_promise = $.async_derived(() => foo());

			promise = $.async_derived(() => bar(), void 0, void 0, 1);
			e_promise = $.async_derived(() => foo(), void 0, void 0, 4);
			a = await a_promise;
		},

		async () => {
			c_promise = $.async_derived(() => bar($.get(a)), void 0, void 0, 2);

			var $$d = await promise;

			b = $.derived(() => $.get($$d).b);
		},
		async () => c = await c_promise,
		async () => d = await $.async_derived(() => get_c()),
		async () => e = await e_promise,
		baz,
		async () => f = await $.async_derived(() => foo()),
		() => count = items.length,
		async () => g = await $.async_derived(() => fill(items))
	]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} ${$.get(b) ?? ''} ${$.get(c) ?? ''} ${$.get(d) ?? ''} ${$.get(e) ?? ''} ${$.get(f) ?? ''} ${count ?? ''} ${$.get(g) ?? ''}`), void 0, void 0, [
		$$promises[3],
		$$promises[1],
		$$promises[4],
		$$promises[6],
		$$promises[7],
		$$promises[8]
	]);

	$.append($$anchor, text);
}