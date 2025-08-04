import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <svg></svg> <custom-element></custom-element> <div></div> <svg></svg> <custom-element></custom-element>`, 3);

export default function Main($$anchor) {
	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';

	let y = () => 'test';
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_attribute(div, 'foobar', x);

	var svg = $.sibling(div, 2);

	$.set_attribute(svg, 'viewBox', x);

	var custom_element = $.sibling(svg, 2);

	$.set_custom_element_data(custom_element, 'fooBar', x);

	var div_1 = $.sibling(custom_element, 2);
	var svg_1 = $.sibling(div_1, 2);
	var custom_element_1 = $.sibling(svg_1, 2);

	$.template_effect(() => $.set_custom_element_data(custom_element_1, 'fooBar', y()));

	$.template_effect(
		($0, $1) => {
			$.set_attribute(div_1, 'foobar', $0);
			$.set_attribute(svg_1, 'viewBox', $1);
		},
		[y, y]
	);

	$.append($$anchor, fragment);
}