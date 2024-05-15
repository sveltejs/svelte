import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import TextInput from './Child.svelte';

var root_1 = $.template(`Something`, 1);
var root = $.template(`<!> `, 1);

export default function Bind_component_snippet($$anchor) {
	var snippet = ($$anchor) => {
		var fragment = root_1();

		$.append($$anchor, fragment);
	};

	let value = $.source('');
	const _snippet = snippet;
	var fragment_1 = root();
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

	$.template_effect(() => $.set_text(text, ` value: ${$.stringify($.get(value))}`));
	$.append($$anchor, fragment_1);
}