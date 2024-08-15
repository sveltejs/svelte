import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<header><nav><a href="/">Home</a> <a href="/away">Away</a></nav></header>`);

export default function Skip_static_subtree($$anchor) {
	var header = root();

	$.append($$anchor, header);
}