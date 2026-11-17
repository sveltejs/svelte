import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

export default function Async_top_level_group_sync_run($$anchor) {
	const $$script = $.script_replay(
		($$bindings, $$access) => {
			let b, c;

			return {
				thunks: [
					() => Promise.resolve(1),
					() => void 0,
					() => void 0,
					() => {
						b = $.get($$bindings[0]) + 1;
						c = b + 1;

						return [b, c];
					}
				],
				environment: []
			};
		},
		['await', 'local', 'local'],
		[0, 1, 1],
		[[1, 3, 3]]
	);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.script_value($$script, 2)), void 0, void 0, [$$script.ready[1]]);
	$.append($$anchor, text);
}