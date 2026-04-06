import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_top_level_group_sync_run($$renderer) {
	var a,
		// these should be grouped into one, having an async tick inbetween
		// would change how the code runs and could introduce subtle timing bugs
		b,
		c;

	var $$promises = $$renderer.run([
		async () => a = await Promise.resolve(1),
		() => {
			b = a + 1;
			c = b + 1;
		}
	]);

	$$renderer.push(`<!---->`);
	$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(c)));
}