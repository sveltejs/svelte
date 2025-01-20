import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var on_click = (_, count) => $.update(count);
var root = $.template(`<h1></h1> <b></b> <button> </button> <h1></h1>`, 1);

export default function Nullish_coallescence_omittance($$anchor) {
	let name = 'world';
	let count = $.state(0);
	var fragment = root();
	var h1 = $.first_child(fragment);

	h1.textContent = `Hello, ${name ?? ''}!`;

	var b = $.sibling(h1, 2);

	b.textContent = `${1 ?? 'stuff'}${2 ?? 'more stuff'}${3 ?? 'even more stuff'}`;

	var button = $.sibling(b, 2);

	button.__click = [on_click, count];

	var text = $.child(button);

	$.reset(button);

	var h1_1 = $.sibling(button, 2);

	h1_1.textContent = `Hello, ${name ?? 'earth' ?? ''}`;
	$.template_effect(() => $.set_text(text, `Count is ${$.get(count) ?? ''}`));
	$.append($$anchor, fragment);
}

$.delegate(['click']);