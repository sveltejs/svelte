import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(` <!>`, 1);

export default function Non_reactive_control_structures($$anchor) {
	const a = true;
	let b = true;
	var fragment = root();
	var node = $.first_child(fragment);

	if (a) {
		var $$anchor = node;
		var text = $.text("hello");

		$.append($$anchor, text);
	}

	var node_1 = $.sibling(node, 2);

	$.if(node_1, () => b, ($$anchor) => {
		var text_1 = $.text("world");

		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
}
