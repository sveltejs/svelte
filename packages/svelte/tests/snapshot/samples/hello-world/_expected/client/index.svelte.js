import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

export default function Hello_world($$anchor) {
	var h1 = root($$anchor);

	$.append($$anchor, h1);
}