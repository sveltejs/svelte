import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_blocker_traversal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Two separate top-level async groups produce two blocker indices.
		// blocker $$promises[0]
		// blocker $$promises[1]
		// A chain of plain assignments off `first`. Tracing `chain2` must follow the
		// whole chain back to `first` (blocker index 0).
		// An assignment cycle that also touches `second` (blocker index 1). Tracing
		// must terminate despite `p`/`q` referencing each other.
		// `label` references `chain2` many times (each reference re-enters the shared
		// traversal) alongside `first` (a lower blocker index) and `q`. Its blocker must
		// be the max over every binding it reaches, so dropping any reached binding
		// during the shared traversal would change the emitted index.
		function label() {
			return `${first}-${chain2}${chain2}${chain2}${chain2}-${q}`;
		}

		// A function whose returned closure references a blocked binding: the returned
		// function is assumed callable, so the blocker must still propagate.
		function make() {
			return () => second;
		}

		// The `$effect` special case: the effect body is *not* traced, so referencing
		// `first` only inside an effect must not give `only_effect` a blocker.
		function only_effect() {}

		var first, second, chain0, chain1, chain2, p, q;

		var $$promises = $$renderer.run([
			async () => first = await Promise.resolve('a'),
			async () => second = await Promise.resolve('b'),
			() => {
				chain0 = first;
				chain1 = chain0;
				chain2 = chain1;
				p = void 0;
				q = void 0;
				void (p = q);
				void (q = p);
				void (q = second);
			}
		]);

		$$renderer.push(`<p>`);
		$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(label())));
		$$renderer.push(`</p> <p>`);
		$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(make()())));
		$$renderer.push(`</p> <button>run</button>`);
	});
}