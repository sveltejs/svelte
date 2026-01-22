import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_blockers($$renderer) {
	var a, b;
	var $$promises = $$renderer.run([() => 1, () => a = 1, () => b = a]);

	if (true) {
		$$renderer.push('<!--[-->');
		$$renderer.push(`<p>`);

		$$renderer.async([$$promises[1]], ($$renderer) => {
			$$renderer.push(() => $.escape(a));
		});

		$$renderer.push(`</p>`);
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]-->`);
}