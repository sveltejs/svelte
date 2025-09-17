import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_if_hoisting( $$renderer) {
	 $$renderer.child(async ( $$renderer) => {
		if (await Promise.resolve(true)) {
			 $$renderer.push('<!--[-->');
			 $$renderer.push(async () => $.escape(await Promise.resolve('yes yes yes')));
		} else {
			 $$renderer.push('<!--[!-->');
			 $$renderer.push(async () => $.escape(await Promise.reject('no no no')));
		}
	});

	 $$renderer.push(`<!--]-->`);
}