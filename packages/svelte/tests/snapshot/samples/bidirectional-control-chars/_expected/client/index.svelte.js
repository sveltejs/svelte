import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.template(`⁧⁦def⁩⁦abc⁩⁩ <h1></h1>`, 1);

export default function Bidirectional_control_chars($$anchor) {
	let name = '\u2067\u2066rld\u2069\u2066wo\u2069\u2069';

	$.next();

	var fragment = root();
	var h1 = $.sibling($.first_child(fragment));

	h1.textContent = 'Hello, ⁧⁦rld⁩⁦wo⁩⁩!';
	$.append($$anchor, fragment);
}