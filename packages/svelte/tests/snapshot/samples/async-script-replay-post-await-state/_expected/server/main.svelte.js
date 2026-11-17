import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { input, register } = $$props;
		var constant, count, snapshot, raw, later;

		var $$promises = $$renderer.run([
			() => Promise.resolve(),
			() => {
				constant = 7;
				count = input;
				snapshot = count;
				void register(() => count++);
				raw = { count: 1 };
				void count++;
			},
			() => Promise.resolve(),
			() => later = count
		]);

		$$renderer.push(`<button>increment</button> <button>replace raw</button> `);

		$$renderer.async([$$promises[1]], ($$renderer) => {
			$$renderer.push(`<input type="number"${$.attr('value', count)}/>`);
		});

		$$renderer.push(` <output>`);
		$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(constant)));
		$$renderer.push(` `);
		$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(count)));
		$$renderer.push(` `);
		$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(snapshot)));
		$$renderer.push(` `);
		$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(raw.count)));
		$$renderer.push(` `);
		$$renderer.async([$$promises[3]], ($$renderer) => $$renderer.push(() => $.escape(later)));
		$$renderer.push(`</output>`);
	});
}