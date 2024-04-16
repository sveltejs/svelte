// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import TextInput from './Child.svelte';

var root_1 = $.template(`Something`, 1);
var root = $.template(`<!> `, 1);

function Bind_component_snippet($$anchor, $$props) {
	$.push($$props, true);

	let value = $.source('');
	const _snippet = snippet;
	var fragment_1 = root();

	function snippet($$anchor) {
		var fragment = root_1();

		$.append($$anchor, fragment);
	}

	var node = $.first_child(fragment_1);

	TextInput(node, {
		get value() {
			return $.get(value);
		},
		set value($$value) {
			$.set(value, $.proxy($$value));
		}
	});

	var text = $.sibling(node, true);

	$.render_effect(() => $.set_text(text, ` value: ${$.stringify($.get(value))}`));
	$.append($$anchor, fragment_1);
	$.pop();
}

export default Bind_component_snippet;