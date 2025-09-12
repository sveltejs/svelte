import * as $ from 'svelte/internal/server';

export default function Async_if_alternate_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		if (await Promise.resolve(false)) {
			$$payload.push('<!--[-->');

			$$payload.child(async ($$payload) => {
				$$payload.push(async () => $.escape(await Promise.reject('no no no')));
			});
		} else {
			$$payload.push('<!--[!-->');

			$$payload.child(async ($$payload) => {
				$$payload.push(async () => $.escape(await Promise.resolve('yes yes yes')));
			});
		}

		$$payload.push(`<!--]-->`);
	});
}