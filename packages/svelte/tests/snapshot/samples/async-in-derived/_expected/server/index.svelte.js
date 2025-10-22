import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Async_in_derived($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.async(async ($$renderer) => {
			let yes1 = (await $.save(1))();
			let yes2 = foo((await $.save(1))());

			let no1 = (async () => {
				return await 1;
			})();

			let no2 = async () => {
				return await 1;
			};

			$$renderer.async(async ($$renderer) => {
				if (true) {
					$$renderer.push('<!--[-->');

					const yes1 = (await $.save(1))();
					const yes2 = foo((await $.save(1))());

					const no1 = (async () => {
						return await 1;
					})();

					const no2 = (async () => {
						return await 1;
					})();
				} else {
					$$renderer.push('<!--[!-->');
				}
			});

			$$renderer.push(`<!--]-->`);
		});
	});
}