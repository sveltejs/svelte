// main.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

var frag = $.template(`<div></div> <svg></svg> <custom-element></custom-element> <div></div> <svg></svg> <custom-element></custom-element>`, true);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = $.source('test');
	let y = $.source(() => 'test');
	/* Init */
	var fragment = $.open_frag($$anchor, false, frag);
	var node = $.child_frag(fragment);
	var svg = $.sibling($.sibling(node));
	var custom_element = $.sibling($.sibling(svg));
	var div = $.sibling($.sibling(custom_element));
	var svg_1 = $.sibling($.sibling(div));
	var custom_element_1 = $.sibling($.sibling(svg_1));

	/* Update */
	$.attr_effect(div, "foobar", () => $.get(y)());
	$.attr_effect(svg_1, "viewBox", () => $.get(y)());
	$.set_custom_element_data_effect(custom_element_1, "fooBar", () => $.get(y)());

	var node_foobar;
	var svg_viewBox;
	var custom_element_fooBar;

	$.render_effect(() => {
		if (node_foobar !== (node_foobar = $.get(x))) {
			$.attr(node, "foobar", node_foobar);
		}

		if (svg_viewBox !== (svg_viewBox = $.get(x))) {
			$.attr(svg, "viewBox", svg_viewBox);
		}

		if (custom_element_fooBar !== (custom_element_fooBar = $.get(x))) {
			$.set_custom_element_data(custom_element, "fooBar", custom_element_fooBar);
		}
	});

	$.close_frag($$anchor, fragment);
	$.pop();
}