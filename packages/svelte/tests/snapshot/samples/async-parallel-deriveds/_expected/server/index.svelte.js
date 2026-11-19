import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_parallel_deriveds($$renderer) {
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
		return c();
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

	var $$promises = $$renderer.run([
		async () => {
			var a_promise = $.async_derived(foo);

			promise = $.async_derived(bar);
			e_promise = $.async_derived(foo);
			f_promise = $.async_derived(foo);
			a = await a_promise;
		},

		async () => {
			c_promise = $.async_derived(() => bar(a()));

			var $$d = await promise;

			b = $.derived(() => $$d().b);
		},
		async () => c = await c_promise,
		async () => d = await $.async_derived(get_c),
		async () => e = await e_promise,
		async () => config = await baz(),
		async () => {
			g_promise = $.async_derived(() => foo(config));
			f = await f_promise;
		},
		async () => g = await g_promise,
		() => void setup(),
		async () => h = await $.async_derived(() => foo(items))
	]);

	$$renderer.push(`<!---->`);
	$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(a())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(b())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(c())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[3]], ($$renderer) => $$renderer.push(() => $.escape(d())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[4]], ($$renderer) => $$renderer.push(() => $.escape(e())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[6]], ($$renderer) => $$renderer.push(() => $.escape(f())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[7]], ($$renderer) => $$renderer.push(() => $.escape(g())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[9]], ($$renderer) => $$renderer.push(() => $.escape(h())));
}