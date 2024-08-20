import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<div></div> <svg></svg> <custom-element></custom-element> <div></div> <svg></svg> <custom-element></custom-element>`, 3);

export default function Main($$anchor) {
	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';
	let y = () => 'test';
	var fragment = root();
	var div = $.first_child(fragment);
	var svg = $.sibling($.sibling(div));
	var custom_element = $.sibling($.sibling(svg));
	var div_1 = $.sibling($.sibling(custom_element));

	$.template_effect(() => $.set_attribute(div_1, "foobar", y()));

	var svg_1 = $.sibling($.sibling(div_1));

	$.template_effect(() => $.set_attribute(svg_1, "viewBox", y()));

	var custom_element_1 = $.sibling($.sibling(svg_1));

	$.template_effect(() => $.set_custom_element_data(custom_element_1, "fooBar", y()));

	$.template_effect(() => {
		$.set_attribute(div, "foobar", x);
		$.set_attribute(svg, "viewBox", x);
		$.set_custom_element_data(custom_element, "fooBar", x);
	});

	$.append($$anchor, fragment);
}