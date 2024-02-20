// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Function_prop_no_getter($$anchor, $$props) {
	$.push($$props, true);

	let count = $.source(0);

	function onmouseup() {
		$.set(count, $.get(count) + 2);
	}

	const plusOne = (num) => num + 1;
	/* Init */
	var fragment = $.comment($$anchor);
	var node = $.child_frag(fragment);

	Button(node, {
		onmousedown: () => $.set(count, $.get(count) + 1),
		onmouseup,
		onmouseenter: () => $.set(count, $.proxy(plusOne($.get(count)))),
		children: ($$anchor, $$slotProps) => {
			/* Init */
			var text = $.space_frag($$anchor);

			/* Update */
			$.text_effect(text, () => `clicks: ${$.stringify($.get(count))}`);
			$.close($$anchor, text);
		}
	});

	$.close_frag($$anchor, fragment);
	$.pop();
}