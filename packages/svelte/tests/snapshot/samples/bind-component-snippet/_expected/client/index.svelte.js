import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import TextInput from './Child.svelte';

const snippet = ($$anchor) => {
	$.next();

	var text = $.text("Something");

	$.append($$anchor, text);
};

var root = $.template(`<!> `, 1);

export default function Bind_component_snippet($$anchor) {
	let value = $.state('');
	const _snippet = snippet;
	var fragment = root();
	var node = $.first_child(fragment);

	TextInput(node, {
		get value() {
			return $.get(value);
		},
		set value($$value) {
			$.set(value, $.proxy($$value));
		}
	});

	var text_1 = $.sibling(node);

	$.template_effect(() => $.set_text(text_1, ` value: ${$.get(value) ?? ""}`));
	$.append($$anchor, fragment);
}