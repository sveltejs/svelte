import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// keep current
		function current() {
			return (/* @__PURE__ */ Object.create(null));
		}

		var $$promises = $$renderer.run([
			() => Promise.resolve(),
			() => {
				void void 0;
				void void 0;
			}
		]);

		$$renderer.push(`<p>${$.escape(current())}</p>`);
	});
}