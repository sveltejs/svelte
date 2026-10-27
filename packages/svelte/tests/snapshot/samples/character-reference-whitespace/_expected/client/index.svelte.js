import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><span>Hello,</span><b>world</b></p>`);

export default function Character_reference_whitespace($$anchor) {
	var p = root();

	$.append($$anchor, p);
}