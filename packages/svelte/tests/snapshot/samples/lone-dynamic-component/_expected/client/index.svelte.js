import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

var root = $.from_html(`<!><span></span>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Lone_dynamic_component($$anchor) {
	let Component = $.proxy(A);
	let items = $.proxy([1, 2, 3]);
	let show = true;
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			$.component($$anchor, () => Component, ($$anchor, Component_1) => {
				Component_1($$anchor, {});
			});
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => Component, ($$anchor, Component_2) => {
				Component_2($$anchor, {});
			});

			$.next();
			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if (show) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	$.each(node_3, 17, () => items, $.index, ($$anchor, item) => {
		var fragment_3 = $.comment();
		var node_4 = $.first_child(fragment_3);

		$.component(node_4, () => Component, ($$anchor, Component_3) => {
			Component_3($$anchor, {
				get item() {
					return $.get(item);
				}
			});
		});

		$.append($$anchor, fragment_3);
	});

	$.append($$anchor, fragment);
}