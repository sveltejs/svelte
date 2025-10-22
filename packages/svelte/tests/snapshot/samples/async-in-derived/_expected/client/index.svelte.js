import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_in_derived($$anchor, $$props) {
	$.push($$props, true);

	$.async_body($$anchor, async ($$anchor) => {
		let yes1 = (await $.save($.async_derived(async () => (await $.save(1))())))();
		let yes2 = (await $.save($.async_derived(async () => foo((await $.save(1))()))))();

		let no1 = $.derived(async () => {
			return await 1;
		});

		let no2 = $.derived(() => async () => {
			return await 1;
		});

		if ($.aborted()) return;

		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				$.async_body($$anchor, async ($$anchor) => {
					const yes1 = (await $.save($.async_derived(async () => (await $.save(1))())))();
					const yes2 = (await $.save($.async_derived(async () => foo((await $.save(1))()))))();

					const no1 = $.derived(() => (async () => {
						return await 1;
					})());

					const no2 = $.derived(() => (async () => {
						return await 1;
					})());

					if ($.aborted()) return;
				});
			};

			$.if(node, ($$render) => {
				if (true) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.pop();
}