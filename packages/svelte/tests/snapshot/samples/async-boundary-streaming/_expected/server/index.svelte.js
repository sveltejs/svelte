import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';
import { Warp } from 'svelte';

export default function Async_boundary_streaming($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const warp = new Warp('app');

		$$renderer.push(`<!--[!-->`);

		{
			$$renderer.push(`<p>loading</p>`);
		}

		$$renderer.push(`<!--]-->`);

		$$renderer.background(($$renderer) => {
			$$renderer.push(`<p>`);
			$$renderer.push(async () => $.escape((await $.save(warp.getOrInsertComputed('data', () => Promise.resolve('data'))))()));
			$$renderer.push(`</p>`);
		});
	});
}