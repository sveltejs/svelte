import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1> <b></b> <button> </button> <h1></h1>`, 1);

export default function Nullish_coallescence_omittance($$anchor) {
	let name = 'world';
	let count = $.state(0);
	var fragment = root();
	var h1 = $.first_child(fragment);

	h1.textContent = 'Hello, world!';

	var b = $.sibling(h1, 2);

	b.textContent = '123';

	var button = $.sibling(b, 2);

	button.__click = () => $.update(count);

	var text = $.child(button);

	$.reset(button);

	var h1_1 = $.sibling(button, 2);

	h1_1.textContent = 'Hello, world';
	$.template_effect(() => $.set_text(text, `Count is ${$.get(count) ?? ''}`));
	$.append($$anchor, fragment);
}

$.delegate(['click']);