import * as $ from 'svelte/internal/server';

export default function Async_if_alternate_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		const promises = [Promise.resolve(false)];

		$$payload.child(async ($$payload) => {
			if (await promises[0]) {
				$$payload.push('<!--[-->');

				const promises_1 = [Promise.reject('no no no')];

				$$payload.child(async ($$payload) => {
					$$payload.push(`${$.escape(await promises_1[0])}`);
				});
			} else {
				$$payload.push('<!--[!-->');

				const promises_2 = [Promise.resolve('yes yes yes')];

				$$payload.child(async ($$payload) => {
					$$payload.push(`${$.escape(await promises_2[0])}`);
				});
			}

			$$payload.push(`<!--]-->`);
		});
	});
}