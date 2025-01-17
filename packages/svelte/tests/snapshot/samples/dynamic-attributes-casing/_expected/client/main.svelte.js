import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.template(`<div></div> <svg></svg> <custom-element></custom-element> <div></div> <svg></svg> <custom-element></custom-element>`, 3);

export default function Main($$anchor) {
	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';
	let y = () => 'test';
	var fragment = root();
	var div = $.first_child(fragment);
	var svg = $.sibling(div, 2);
	var custom_element = $.sibling(svg, 2);
	var div_1 = $.sibling(custom_element, 2);
	const expression = $.derived(() => y() ?? '');
	var svg_1 = $.sibling(div_1, 2);
	const expression_1 = $.derived(() => y() ?? '');
	var custom_element_1 = $.sibling(svg_1, 2);
	const expression_2 = $.derived(() => y() ?? '');

	$.template_effect(() => $.set_custom_element_data(custom_element_1, 'fooBar', $.get(expression_2)));

	$.template_effect(() => {
		$.set_attribute(div, 'foobar', x);
		$.set_attribute(svg, 'viewBox', x);
		$.set_custom_element_data(custom_element, 'fooBar', x);
		$.set_attribute(div_1, 'foobar', $.get(expression));
		$.set_attribute(svg_1, 'viewBox', $.get(expression_1));
	});

	$.append($$anchor, fragment);
}