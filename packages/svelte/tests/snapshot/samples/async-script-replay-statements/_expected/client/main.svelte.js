import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> <output> </output>`, 1);

export default function Main($$anchor) {
	let input = $.state(1);
	const load = (value) => Promise.resolve(value);

	console.log('prefix');

	const $$script = $.script_replay(
		($$bindings) => {
			return [
				() => load($.get(input)),
				() => load($.get(input)),
				() => void 0,
				() => load($.get(input) + $.get($$bindings[1])),
				() => void 0,
				() => {
					$.untrack(() => void console.log($.get($$bindings[1])));

					return [void 0];
				},

				() => {
					$.untrack(() => void console.log($.get($$bindings[3])));

					return [void 0];
				}
			];
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
	$.delegated('click', button, () => $.update(input));
	$.append($$anchor, fragment);
}

$.delegate(['click']);