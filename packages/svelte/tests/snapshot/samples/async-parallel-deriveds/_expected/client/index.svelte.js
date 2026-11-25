import 'svelte/internal/init-operations';
import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_parallel_deriveds($$anchor) {
	const items = [];

	// independent of each other, so they are created in parallel
	// reads `a` directly, so it is created once `a` has resolved, in parallel with `b`
	// reads `c` indirectly via `get_c`, so it has to wait for `c`...
	// ...whereas this one is independent of everything before it, so it's created right away
	// a regular top-level `await` doesn't hold up async deriveds that don't depend on it...
	// ...but this one reads `config`, so it has to wait for it
	// `setup` visibly writes `items`, which `h` reads, so `h` has to wait for it
	function setup() {
		items.push(1);
	}

	function get_c() {
		return $.get(c);
	}

	var a,
		b,
		c,
		d,
		e,
		config,
		f,
		g,
		h,
		promise,
		c_promise,
		e_promise,
		f_promise,
		g_promise;

	var $$promises = $.run([
		async () => {
			var a_promise = $.async_derived(() => foo());

			promise = $.async_derived(() => bar(), void 0, void 0, 1);
			e_promise = $.async_derived(() => foo(), void 0, void 0, 4);
			f_promise = $.async_derived(() => foo(), void 0, void 0, 6);
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
		async () => config = await baz(),
		async () => {
			g_promise = $.async_derived(() => foo(config), void 0, void 0, 7);
			f = await f_promise;
		},
		async () => g = await g_promise,
		() => void setup(),
		async () => h = await $.async_derived(() => foo(items))
	]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$.get(a) ?? ''} ${$.get(b) ?? ''} ${$.get(c) ?? ''} ${$.get(d) ?? ''} ${$.get(e) ?? ''} ${$.get(f) ?? ''} ${$.get(g) ?? ''} ${$.get(h) ?? ''}`), void 0, void 0, [
		$$promises[0],
		$$promises[1],
		$$promises[2],
		$$promises[3],
		$$promises[4],
		$$promises[6],
		$$promises[7],
		$$promises[9]
	]);

	$.append($$anchor, text);
}