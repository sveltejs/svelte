// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Function_prop_no_getter($$payload, $$props) {
	$.push(true);

	let count = 0;

	function onmouseup() {
		count += 2;
	}

	const anchor = $.create_anchor($$payload);

	$$payload.out += `${anchor}`;

	Button($$payload, {
		onmousedown: () => count += 1,
		onmouseup,
		children: ($$payload, $$slotProps) => {
			$$payload.out += `clicks: ${$.escape(count)}`;
		}
	});

	$$payload.out += `${anchor}`;
	$.pop();
}
