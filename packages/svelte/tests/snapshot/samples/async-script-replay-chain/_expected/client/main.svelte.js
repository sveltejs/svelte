import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button>update</button> <output> </output> <!>`, 1);

export default function Main($$anchor) {
	let input = $.state(1);
	const load = (value) => Promise.resolve(value + 1);

	const $$script = $.script_replay(
		($$bindings) => {
			let snapshot;

			return [
				() => load($.get(input)),
				() => $.get($$bindings[0]) * 2,
				() => snapshot = $.get($$bindings[0]),
				() => load($.get($$bindings[1]) + $.get($$bindings[2]))
			];
		},
		['async', 'derived', 'local', 'async'],
		[0, 1, 1, 2]
	);

	var fragment = root_1();
	var button = $.first_child(fragment);
	var output = $.sibling(button, 2);
	var text = $.only_child(output);
	var node = $.sibling(output, 2);

	$.script_async(node, [$$script.ready[2]], (node) => {
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.script_template_effect(() => $.set_text(text_1, $.get($.script_binding($$script, 3))), void 0, [$$script.ready[2]]);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get($.script_binding($$script, 3))) $$render(consequent);
		});
	});

	$.script_template_effect(() => $.set_text(text, `${$.get($.script_binding($$script, 0)) ?? ''} ${$.get($.script_binding($$script, 1)) ?? ''} ${$.script_value($$script, 2) ?? ''} ${$.get($.script_binding($$script, 3)) ?? ''}`), void 0, [$$script.ready[2]]);
	$.delegated('click', button, () => $.update(input));
	$.append($$anchor, fragment);
}

$.delegate(['click']);