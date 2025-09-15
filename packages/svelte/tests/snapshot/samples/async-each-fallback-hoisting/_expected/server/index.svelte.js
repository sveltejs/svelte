import * as $ from 'svelte/internal/server';

export default function Async_each_fallback_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		const each_array = $.ensure_array_like(await Promise.resolve([]));

		if (each_array.length !== 0) {
			$$payload.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$payload.push(`<!---->`);
				$$payload.push(async () => $.escape(await Promise.reject('This should never be reached')));
			}
		} else {
			$$payload.push('<!--[!-->');
			$$payload.push(`<!---->`);
			$$payload.push(async () => $.escape(await Promise.resolve(4)));
		}
	});

	$$payload.push(`<!--]-->`);
}