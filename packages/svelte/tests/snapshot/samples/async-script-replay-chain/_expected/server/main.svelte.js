import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let input = 1;
	const load = (value) => Promise.resolve(value + 1);
	var a, doubled, snapshot, b;

	var $$promises = $$renderer.run([
		async () => a = await $.async_derived(() => load(input)),
		() => {
			doubled = $.derived(() => a() * 2);
			snapshot = a();
		},
		async () => b = await $.async_derived(() => load(doubled() + snapshot))
	]);

	$$renderer.push(`<button>update</button> <output>`);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(a())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(doubled())));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(snapshot)));
	$$renderer.push(` `);
	$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(b())));
	$$renderer.push(`</output> `);

	$$renderer.async_block([$$promises[2]], ($$renderer) => {
		if (b()) {
			$$renderer.push(`<!--[0--><p>`);
			$$renderer.async([$$promises[2]], ($$renderer) => $$renderer.push(() => $.escape(b())));
			$$renderer.push(`</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}
	});

	$$renderer.push(`<!--]-->`);
}