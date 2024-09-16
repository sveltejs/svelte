import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<!> <!> <!>`, 1);

export default function Non_reactive_control_structures($$anchor) {
	const a = true;
	let b = true;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $$anchor = node;

		$.next();

		if (a) {
			var text = $.text("hello");

			$.append($$anchor, text);
		}
	}

	var node_1 = $.sibling(node, 2);

	$.if(node_1, () => b, ($$anchor) => {
		var text_1 = $.text("world");

		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $$anchor = node_2;

		$.next();

		if (a) {
			var text_2 = $.text("hi");

			$.append($$anchor, text_2);
		} else {
			var text_3 = $.text("earth");

			$.append($$anchor, text_3);
		}
	}

	$.append($$anchor, fragment);
}