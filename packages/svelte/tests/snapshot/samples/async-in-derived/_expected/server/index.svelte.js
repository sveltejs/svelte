import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_in_derived($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var yes1, yes2, no1, no2;

		var $$promises = $$renderer.run([
			async () => yes1 = await 1,
			async () => yes2 = foo(await 1),

			() => no1 = (async () => {
				return await 1;
			})(),

			() => no2 = async () => {
				return await 1;
			}
		]);

		if (true) {
			$$renderer.push('<!--[-->');

			let yes1;
			let yes2;
			let no1;
			let no2;

			var promises = $$renderer.run([
				async () => {
					yes1 = (await $.save(1))();
				},

				async () => {
					yes2 = foo((await $.save(1))());
				},

				() => {
					no1 = (async () => {
						return await 1;
					})();
				},

				() => {
					no2 = (async () => {
						return await 1;
					})();
				}
			]);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}