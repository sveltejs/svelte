import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_const($$renderer) {
	if (true) {
		$$renderer.push('<!--[-->');

		let a;
		let b;

		var promises = $$renderer.run([
			async () => {
				a = (await $.save(1))();
			},

			() => {
				b = a + 1;
			}
		]);

		$$renderer.push(`<p>`);
		$$renderer.async([promises[1]], ($$renderer) => $$renderer.push(() => $.escape(b)));
		$$renderer.push(`</p>`);
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]-->`);
}