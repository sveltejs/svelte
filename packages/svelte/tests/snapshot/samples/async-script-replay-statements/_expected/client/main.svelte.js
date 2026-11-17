import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> <output> </output>`, 1);

export default function Main($$anchor) {
	const $$script = $.script_replay(
		($$bindings, $$access) => {
			let input = $$access.state(0, $.state(1));
			const load = (value) => Promise.resolve(value);

			console.log('prefix');

			return {
				thunks: [
					() => $$access.read(1)($$access.read(0)),
					() => $$access.read(1)($$access.read(0)),
					() => void 0,
					() => $$access.read(1)($$access.read(0) + $.get($$bindings[1])),
					() => void 0,
					() => {
						void console.log($.get($$bindings[1]));

						return [void 0];
					},

					() => {
						void console.log($.get($$bindings[3]));

						return [void 0];
					}
				],
				environment: [
					{
						reactive: true,
						read: () => $.get(input),
						assign: ($$value, $$proxy) => $$proxy ? $.set(input, $$value, true) : $.set(input, $$value),
						update: ($$delta, $$pre) => $$delta === -1
							? $$pre ? $.update_pre(input, -1) : $.update(input, -1)
							: $$pre ? $.update_pre(input) : $.update(input)
					},
					{ reactive: true, read: () => load }
				]
			};
		},
		['await', 'await', 'statement', 'async', 'statement'],
		[0, 1, 2, 3, 4],
		[[2, 3, 5], [4, 5, 6]]
	);

	var fragment = root();
	var button = $.first_child(fragment);
	var output = $.sibling(button, 2);
	var text = $.only_child(output);

	$.template_effect(() => $.set_text(text, `${$.get($.script_binding($$script, 3)) ?? ''} ${$.script_value($$script, 1) ?? ''}`), void 0, void 0, [$$script.ready[4]]);
	$.delegated('click', button, () => $.script_accessor($$script, 0).update(1, false));
	$.append($$anchor, fragment);
}

$.delegate(['click']);