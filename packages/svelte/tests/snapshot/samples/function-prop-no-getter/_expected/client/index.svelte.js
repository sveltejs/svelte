// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Function_prop_no_getter($$anchor, $$props) {
	$.push($$props, true);

	let count = $.source(0);

	function onmouseup() {
		$.set(count, $.proxy($.get(count) + 2));
	}

	/* Init */
	var fragment = $.comment($$anchor);
	var node = $.child_frag(fragment);

	Button(node, {
		onmousedown: () => $.set(count, $.proxy($.get(count) + 1)),
		onmouseup,
		children: ($$anchor, $$slotProps) => {
			/* Init */
			var node_1 = $.space($$anchor);

			/* Update */
			$.text_effect(node_1, () => `clicks: ${$.stringify($.get(count))}`);
			$.close($$anchor, node_1);
		}
	});

	$.close_frag($$anchor, fragment);
	$.pop();
}