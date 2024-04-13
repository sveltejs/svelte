// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

function Function_prop_no_getter($$anchor, $$props) {
	$.push($$props, true);

	let count = $.source(0);

	function onmouseup() {
		$.set(count, $.get(count) + 2);
	}

	const plusOne = (num) => num + 1;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	Button(node, {
		onmousedown: () => $.set(count, $.get(count) + 1),
		onmouseup,
		onmouseenter: () => $.set(count, $.proxy(plusOne($.get(count)))),
		children: ($$anchor, $$slotProps) => {
			var text = $.text($$anchor);

			$.render_effect(() => $.set_text(text, `clicks: ${$.stringify($.get(count))}`));
			$.append($$anchor, text);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

export default Function_prop_no_getter;