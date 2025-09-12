import * as $ from 'svelte/internal/server';

export default function Async_each_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		const first = Promise.resolve(1);
		const second = Promise.resolve(2);
		const third = Promise.resolve(3);

		$$payload.child(async ($$payload) => {
			const each_array = $.ensure_array_like(await Promise.resolve([first, second, third]));

			$$payload.push(`<!--[-->`);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$payload.child(async ($$payload) => {
					$$payload.push(`<!---->${$.escape(await item)}`);
				});
			}

			$$payload.push(`<!--]-->`);
		});
	});
}