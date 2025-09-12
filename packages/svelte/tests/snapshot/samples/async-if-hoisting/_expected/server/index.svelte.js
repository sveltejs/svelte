import * as $ from 'svelte/internal/server';

export default function Async_if_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		$$payload.child(async ($$payload) => {
			if (await Promise.resolve(true)) {
				$$payload.push('<!--[-->');

				$$payload.child(async ($$payload) => {
					$$payload.push(`${$.escape(await Promise.resolve('yes yes yes'))}`);
				});
			} else {
				$$payload.push('<!--[!-->');

				$$payload.child(async ($$payload) => {
					$$payload.push(`${$.escape(await Promise.reject('no no no'))}`);
				});
			}

			$$payload.push(`<!--]-->`);
		});
	});
}