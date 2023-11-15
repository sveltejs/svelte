// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

var Button_default = $.template(` `, true);
var frag = $.template(`<!>`, true);

export default function Function_prop_no_getter($$anchor, $$props) {
	$.push($$props, true);

	let count = $.source(0);

	function onmouseup() {
		$.set(count, $.get(count) + 2);
	}

	/* Init */
	var fragment = $.open_frag($$anchor, true, frag);
	var node = $.child_frag(fragment);

	Button(node, {
		onmousedown: () => $.set(count, $.get(count) + 1),
		onmouseup,
		children: ($$anchor, $$slotProps) => {
			/* Init */
			var fragment_1 = $.open_frag($$anchor, true, Button_default);
			var text = $.child_frag(fragment_1);

			/* Update */
			$.text_effect(text, () => `clicks: ${$.stringify($.get(count))}`);
			$.close_frag($$anchor, fragment_1);
		}
	});

	$.close_frag($$anchor, fragment);
	$.pop();
}
