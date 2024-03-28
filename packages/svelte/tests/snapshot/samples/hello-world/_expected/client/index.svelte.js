// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<h1>hello world</h1>`);

export default function Hello_world($$anchor, $$props) {
	$.push($$props, false);
	$.init();

	var h1 = root();

	$.append($$anchor, h1);
	$.pop();
}