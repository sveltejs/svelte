import * as $ from 'svelte/internal/server';

export default function Async_each_fallback_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		const promises = [Promise.resolve([])];
		const each_array = $.ensure_array_like(await promises[0]);

		$$payload.child(async ($$payload) => {
			if (each_array.length !== 0) {
				$$payload.push('<!--[-->');

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];
					const promises_1 = [Promise.reject('This should never be reached')];

					$$payload.child(async ($$payload) => {
						$$payload.push(`<!---->${$.escape(await promises_1[0])}`);
					});
				}
			} else {
				$$payload.push('<!--[!-->');

				const promises_2 = [Promise.resolve(4)];

				$$payload.child(async ($$payload) => {
					$$payload.push(`<!---->${$.escape(await promises_2[0])}`);
				});
			}

			$$payload.push(`<!--]-->`);
		});
	});
}