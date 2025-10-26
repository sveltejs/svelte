import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_if_alternate_hoisting($$renderer) {
	$$renderer.async_block([], async ($$renderer) => {
		if ((await $.save(Promise.resolve(false)))()) {
			$$renderer.push('<!--[-->');
			$$renderer.push(async () => $.escape(await Promise.reject('no no no')));
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(async () => $.escape(await Promise.resolve('yes yes yes')));
		}
	});

	$$renderer.push(`<!--]-->`);
}