import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_if_hoisting($$payload) {
	$$payload.child(async ($$payload) => {
		if (await Promise.resolve(true)) {
			$$payload.push('<!--[-->');
			$$payload.push(async () => $.escape(await Promise.resolve('yes yes yes')));
		} else {
			$$payload.push('<!--[!-->');
			$$payload.push(async () => $.escape(await Promise.reject('no no no')));
		}
	});

	$$payload.push(`<!--]-->`);
}