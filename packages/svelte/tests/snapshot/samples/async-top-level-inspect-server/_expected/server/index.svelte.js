import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_top_level_inspect_server($$renderer) {
	var data;
	var $$promises = $$renderer.run([async () => data = await Promise.resolve(42),,]);

	$$renderer.push(`<p>`);

	$$renderer.async([$$promises[1]], ($$renderer) => {
		$$renderer.push(() => $.escape(data));
	});

	$$renderer.push(`</p>`);
}