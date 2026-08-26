import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

var root = $.from_html(`<!><span></span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Lone_dynamic_component($$anchor) {
	let Component = $.proxy(A);
	let items = $.proxy([1, 2, 3]);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		$.component($$anchor, () => Component, ($$anchor, Component_1) => {
			Component_1($$anchor, {
				get item() {
					return $.get(item);
				}
			});
		});
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
		var fragment_2 = root();
		var node_2 = $.first_child(fragment_2);

		$.component(node_2, () => Component, ($$anchor, Component_2) => {
			Component_2($$anchor, {
				get item() {
					return $.get(item);
				}
			});
		});

		$.next();
		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
}