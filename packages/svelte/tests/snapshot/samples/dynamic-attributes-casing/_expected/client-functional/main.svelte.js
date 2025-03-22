import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.template_fn(
	() => {
		var div = document.createElement('div');
		var text = document.createTextNode(' ');
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var text_1 = document.createTextNode(' ');
		var custom_element = document.createElement('custom-element');
		var text_2 = document.createTextNode(' ');
		var div_1 = document.createElement('div');
		var text_3 = document.createTextNode(' ');
		var svg_1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var text_4 = document.createTextNode(' ');
		var custom_element_1 = document.createElement('custom-element');
		var fragment = document.createDocumentFragment();

		fragment.append(div, text, svg, text_1, custom_element, text_2, div_1, text_3, svg_1, text_4, custom_element_1)
		return fragment;
	},
	3
);

export default function Main($$anchor) {
	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';
	let y = () => 'test';
	var fragment = root();
	var div = $.first_child(fragment);
	var svg = $.sibling(div, 2);
	var custom_element = $.sibling(svg, 2);

	$.template_effect(() => $.set_custom_element_data(custom_element, 'fooBar', x));

	var div_1 = $.sibling(custom_element, 2);
	var svg_1 = $.sibling(div_1, 2);
	var custom_element_1 = $.sibling(svg_1, 2);

	$.template_effect(() => $.set_custom_element_data(custom_element_1, 'fooBar', y()));

	$.template_effect(
		($0, $1) => {
			$.set_attribute(div, 'foobar', x);
			$.set_attribute(svg, 'viewBox', x);
			$.set_attribute(div_1, 'foobar', $0);
			$.set_attribute(svg_1, 'viewBox', $1);
		},
		[y, y]
	);

	$.append($$anchor, fragment);
}