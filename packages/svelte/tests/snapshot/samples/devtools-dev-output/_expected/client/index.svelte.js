import 'my-devtools/runtime';
import 'svelte/internal/disclose-version';

Devtools_dev_output[$.FILENAME] = 'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte';

import * as $ from 'svelte/internal/client';
import { counter } from './state.svelte.js';

var root = $.add_locations($.from_html(`<button> </button>`), Devtools_dev_output[$.FILENAME], [[17, 0]]);

export default function Devtools_dev_output($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Devtools_dev_output);

	let count = $.tag($.state(0), 'count', 'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte:4:5');
	let doubled = $.tag($.derived(() => $.get(count) * 2), 'doubled', 'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte:5:5');
	const todo = $.tag_proxy($.proxy({ done: false }), 'todo', 'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte:6:7');

	$.user_effect(
		() => {
			console.log(...$.log_if_contains_state('log', $.get(count)));
		},
		'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte:8:1'
	);

	$.user_pre_effect(
		() => {
			todo.done;
		},
		'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte:12:1'
	);

	var $$exports = { ...$.legacy_api() };
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} ${$.get(doubled) ?? ''} ${todo.done ?? ''} ${counter.value ?? ''}`));

	$.delegated('click', button, function click() {
		return $.update(count);
	});

	root.hydrate_assign_locations(button);
	$.append($$anchor, button);

	return $.pop($$exports);
}

$.delegate(['click']);