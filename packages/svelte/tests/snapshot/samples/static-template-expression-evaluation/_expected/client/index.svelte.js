import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var on_click = (_, count) => $.update(count);
var root = $.template(`<h1></h1> <p></p> <button> </button> <p></p> <p></p> <p></p> <!>`, 1);

export default function Static_template_expression_evaluation($$anchor) {
	let a = 1;
	let b = 2;
	let name = 'world';
	let count = $.state(0);

	function Component() {} // placeholder component

	var fragment = root();
	var h1 = $.first_child(fragment);

	h1.textContent = 'Hello, world!';

	var p = $.sibling(h1, 2);

	p.textContent = '1 + 2 = 3';

	var button = $.sibling(p, 2);

	button.__click = [on_click, count];

	var text = $.child(button);

	$.reset(button);

	var p_1 = $.sibling(button, 2);

	p_1.textContent = '1 + 2 = 3';

	var p_2 = $.sibling(p_1, 2);

	p_2.textContent = 'Sum is 3';

	var p_3 = $.sibling(p_2, 2);

	p_3.textContent = '1';

	var node = $.sibling(p_3, 2);

	Component(node, {
		a: 1,
		get count() {
			return $.get(count);
		},
		c: 3
	});

	$.template_effect(() => $.set_text(text, `Count is ${$.get(count) ?? ""}`));
	$.append($$anchor, fragment);
}

$.delegate(['click']);