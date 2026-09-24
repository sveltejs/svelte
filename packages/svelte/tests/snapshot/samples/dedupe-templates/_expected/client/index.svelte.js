import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="x">hello</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dedupe_templates($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var p_1 = root();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if ($$props.a) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_2 = root();

			$.append($$anchor, p_2);
		};

		$.if(node_1, ($$render) => {
			if ($$props.b) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}