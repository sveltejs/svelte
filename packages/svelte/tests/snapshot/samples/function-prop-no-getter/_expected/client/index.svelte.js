import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Function_prop_no_getter($$anchor) {
	let count = $.source(0);

	function onmouseup() {
		$.set(count, $.get(count) + 2);
	}

	const plusOne = (num) => num + 1;

	Button($$anchor, {
		onmousedown: () => $.set(count, $.get(count) + 1),
		onmouseup,
		onmouseenter: () => $.set(count, $.proxy(plusOne($.get(count)))),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ""}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}