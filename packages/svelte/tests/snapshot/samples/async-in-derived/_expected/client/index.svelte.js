import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_in_derived($$anchor, $$props) {
	$.push($$props, true);

	var yes1, yes2, no1, no2;

	var $$promises = $.run([
		async () => yes1 = await $.async_derived(() => 1),
		async () => yes2 = await $.async_derived(async () => foo(await 1)),

		() => no1 = $.derived(async () => {
			return await 1;
		}),

		() => no2 = $.derived(() => async () => {
			return await 1;
		})
	]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			let yes1;
			let yes2;
			let no1;
			let no2;

			var promises = $.run([
				async () => yes1 = (await $.save($.async_derived(async () => (await $.save(1))())))(),
				async () => yes2 = (await $.save($.async_derived(async () => foo((await $.save(1))()))))(),

				() => no1 = $.derived(() => (async () => {
					return await 1;
				})()),

				() => no2 = $.derived(() => (async () => {
					return await 1;
				})())
			]);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}