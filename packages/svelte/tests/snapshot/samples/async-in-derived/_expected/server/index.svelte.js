import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_in_derived($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var yes1, yes2, no1, no2;

		var $$promises = $$renderer.run([
			async () => {
				var yes1_promise = $.async_derived(() => 1);
				var yes2_promise = $.async_derived(async () => foo(await 1));

				yes1 = await yes1_promise;
				yes2 = await yes2_promise;
			},

			() => {
				no1 = $.derived(async () => {
					return await 1;
				});

				no2 = $.derived(() => async () => {
					return await 1;
				});
			}
		]);

		if (true) {
			$$renderer.push('<!--[0-->');

			let yes1;
			let yes2;
			let no1;
			let no2;

			var promises = $$renderer.run([
				async () => yes1 = (await $.save(1))(),
				async () => yes2 = foo((await $.save(1))()),
				() => no1 = (async () => {
					return await 1;
				})(),

				() => no2 = (async () => {
					return await 1;
				})()
			]);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (true) {
			$$renderer.push('<!--[0-->');

			let x;
			var promises_1 = $$renderer.run([() => $$promises[1], () => x = no2()]);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}