// index.svelte (Svelte v5.0.0-next.9)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Function_prop_no_getter($$anchor, $$props) {
	$.push($$props, true);

	let count = $.source(0);

	function onmouseup() {
		$.set(count, $.get(count) + 2);
	}

	/* Init */
	var fragment = $.comment($$anchor);
	var node = $.child_frag(fragment);

	Button(node, {
		onmousedown: () => $.set(count, $.get(count) + 1),
		onmouseup,
		children: ($$anchor, $$slotProps) => {
			/* Init */
			var fragment_1 = $.space($$anchor);
			var node_1 = $.child_frag(fragment_1);

			/* Update */
			$.text_effect(node_1, () => `clicks: ${$.stringify($.get(count))}`);
			$.close_frag($$anchor, fragment_1);
		}
	});

	$.close_frag($$anchor, fragment);
	$.pop();
}
