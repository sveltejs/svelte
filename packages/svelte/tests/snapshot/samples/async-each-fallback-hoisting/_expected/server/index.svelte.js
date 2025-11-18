import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_each_fallback_hoisting($$renderer) {
	$$renderer.async_block([], async ($$renderer) => {
		const each_array = $.ensure_array_like((await $.save(Promise.resolve([])))());

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<!---->`);
				$$renderer.push(async () => $.escape(await Promise.reject('This should never be reached')));
			}
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<!---->`);
			$$renderer.push(async () => $.escape(await Promise.resolve(4)));
		}
	});

	$$renderer.push(`<!--]-->`);
}