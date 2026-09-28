import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img alt=""/>`, 2);
var root_1 = $.from_html(`<picture></picture>`, 2);
var root_2 = $.from_html(`<source/>`, 2);
var root_3 = $.from_html(`<div><img alt=""/></div> <span></span>`, 3);
var root_4 = $.from_html(`<div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Responsive_elements_import_node($$anchor) {
	var fragment = root_5();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var picture = root_1();

			$.append($$anchor, picture);
		};

		$.if(node_1, ($$render) => {
			if (true) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var source = root_2();

			$.append($$anchor, source);
		};

		$.if(node_2, ($$render) => {
			if (true) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_3();

			$.next(2);
			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if (true) $$render(consequent_3);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div = root_4();

			$.append($$anchor, div);
		};

		$.if(node_4, ($$render) => {
			if (true) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
}
