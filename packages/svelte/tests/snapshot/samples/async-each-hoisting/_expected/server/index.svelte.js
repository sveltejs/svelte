import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_each_hoisting($$renderer) {
	const first = Promise.resolve(1);
	const second = Promise.resolve(2);
	const third = Promise.resolve(3);

	$$renderer.push(`<!--[-->`);

	$$renderer.async_block([], async ($$renderer) => {
		const each_array = $.ensure_array_like((await $.save(Promise.resolve([first, second, third])))());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<!---->`);
			$$renderer.push(async () => $.escape(await item));
		}
	});

	$$renderer.push(`<!--]-->`);
}