import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

var root = $.template(`<div></div> <svg></svg> <custom-element></custom-element> <div></div> <svg></svg> <custom-element></custom-element>`, 3);

export default function Main($$anchor) {
	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';
	let y = () => 'test';
	var fragment = root();
	var div = $.first_child(fragment);

	$.reset(div);

	var svg = $.sibling($.sibling(div, true));

	$.reset(svg);

	var custom_element = $.sibling($.sibling(svg, true));

	$.reset(custom_element);

	var div_1 = $.sibling($.sibling(custom_element, true));

	$.template_effect(() => $.set_attribute(div_1, "foobar", y()));
	$.reset(div_1);

	var svg_1 = $.sibling($.sibling(div_1, true));

	$.template_effect(() => $.set_attribute(svg_1, "viewBox", y()));
	$.reset(svg_1);

	var custom_element_1 = $.sibling($.sibling(svg_1, true));

	$.template_effect(() => $.set_custom_element_data(custom_element_1, "fooBar", y()));
	$.reset(custom_element_1);

	$.template_effect(() => {
		$.set_attribute(div, "foobar", x);
		$.set_attribute(svg, "viewBox", x);
		$.set_custom_element_data(custom_element, "fooBar", x);
	});

	$.append($$anchor, fragment);
	return {};
}