import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_parallel_deriveds($$renderer) {
	// independent of each other, so they are created in parallel
	// reads `a` directly, so it has to wait for the previous group
	// reads `c` indirectly via `get_c`, so it has to wait for `c`...
	// ...and this one is independent of `d`, so it's created in parallel with it
	// a regular top-level `await` in between means it has to wait
	function get_c() {
		return c();
	}

	var a, b, c, d, e, f;

	var $$promises = $$renderer.run([
		async () => {
			var a_promise = $.async_derived(foo);
			var promise = $.async_derived(bar);

			a = await a_promise;

			var $$d = await promise;

			b = $.derived(() => $$d().b);
		},
		async () => c = await $.async_derived(() => bar(a())),
		async () => {
			var d_promise = $.async_derived(get_c);
			var e_promise = $.async_derived(foo);

			d = await d_promise;
			e = await e_promise;
		},
		baz,
		async () => f = await $.async_derived(foo)
	]);

	$$renderer.push(`<!---->`);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(a())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(b())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(c())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(d())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(e())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[4]], ($$renderer) => $$renderer.push(() => $.escape(f())));
}