import "svelte/internal/disclose-version";
import "svelte/internal/legacy-component";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

export default function Hello_world($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}