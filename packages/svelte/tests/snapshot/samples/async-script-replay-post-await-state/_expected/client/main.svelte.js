import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increment</button> <button>replace raw</button> <input type="number"/> <output> </output>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $$script = $.script_replay(
		($$bindings, $$access) => {
			let constant, count, snapshot, raw, later;

			return {
				thunks: [
					() => Promise.resolve(),
					() => void 0,
					() => void 0,
					() => void 0,
					() => void 0,
					() => void 0,
					() => void 0,
					() => Promise.resolve(),
					() => void 0,
					() => {
						constant = $$access.state(3, $.state(7));
						count = $$access.state(4, $.state($.proxy($$access.read(0))));
						snapshot = $.get(count);
						void $$access.read(1)(() => $.update(count));
						raw = $$access.state(7, $.state({ count: 1 }));
						void $.update(count);

						return [constant, count, snapshot, void 0, raw, void 0];
					},

					() => {
						later = $$access.read(4);

						return [later];
					}
				],
				environment: [
					{ reactive: true, read: () => $$props.input },
					{ reactive: true, read: () => $$props.register }
				]
			};
		},
		[
			'await',
			'state',
			'state',
			'local',
			'statement',
			'state',
			'statement',
			'await',
			'local'
		],
		[0, 1, 1, 1, 1, 1, 1, 2, 3],
		[[1, 7, 9], [8, 9, 10]]
	);

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var input_1 = $.sibling(button_1, 2);

	$.remove_input_defaults(input_1);

	var output = $.sibling(input_1, 2);
	var text = $.only_child(output);

	$.template_effect(() => $.set_text(text, `${$.script_read($$script, 3) ?? ''} ${$.script_read($$script, 4) ?? ''} ${$.script_value($$script, 3) ?? ''} ${$.script_read($$script, 7).count ?? ''} ${$.script_value($$script, 8) ?? ''}`), void 0, void 0, [
		$$script.ready[1],
		$$script.ready[1],
		$$script.ready[1],
		$$script.ready[1],
		$$script.ready[3]
	]);

	$.delegated('click', button, () => $.update($.get($.script_binding($$script, 2))));
	$.delegated('click', button_1, () => $.set($.get($.script_binding($$script, 5)), { count: $.script_read($$script, 7).count + 1 }));

	$.run_after_blockers([$$script.ready[1]], () => {
		$.bind_value(input_1, () => $.script_read($$script, 4), ($$value) => $.set($.get($.script_binding($$script, 2)), $$value));
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);