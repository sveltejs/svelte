import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function State_is($$anchor) {
	const obj = {};
	const a = $.proxy(obj);
	const b = $.proxy(obj);

	a === obj;
	$.is(a, obj);
	a === b;
	$.is(a, b);
}