import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>update</button> <output> </output> <!>`, 1);

export default function Main($$anchor) {
	const $$script = $.script_replay(
		($$bindings, $$access) => {
			let input = $$access.state(0, $.state(1));
			const load = (value) => Promise.resolve(value + 1);
			let snapshot;

			return {
				thunks: [
					() => $$access.read(1)($$access.read(0)),
					() => $.get($$bindings[0]) * 2,
					() => void 0,
					() => $$access.read(1)($.get($$bindings[1]) + $.get($$bindings[2])),
					() => {
						snapshot = $.get($$bindings[0]);

						return [void 0, snapshot];
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
		['async', 'derived', 'local', 'async'],
		[0, 1, 1, 2],
		[[1, 3, 4]]
	);

	var fragment = root_1();
	var button = $.first_child(fragment);
	var output = $.sibling(button, 2);
	var text = $.only_child(output);
	var node = $.sibling(output, 2);

	$.async(node, [$$script.ready[2]], void 0, (node) => {
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get($.script_binding($$script, 3))), void 0, void 0, [$$script.ready[2]]);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get($.script_binding($$script, 3))) $$render(consequent);
		});
	});

	$.template_effect(() => $.set_text(text, `${$.get($.script_binding($$script, 0)) ?? ''} ${$.get($.script_binding($$script, 1)) ?? ''} ${$.script_value($$script, 2) ?? ''} ${$.get($.script_binding($$script, 3)) ?? ''}`), void 0, void 0, [$$script.ready[2]]);
	$.delegated('click', button, () => $.script_accessor($$script, 0).update(1, false));
	$.append($$anchor, fragment);
}

$.delegate(['click']);