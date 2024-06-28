import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Props_identifier($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, ["$$slots", "$$events", "$$legacy"]);

	$$props.a;
	props[a];
	$$props.a.b;
	$$props.a.b = true;
	props.a = true;
	props[a] = true;
	props;
	$.pop();
}