import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root_1 = $.from_html(`<button type="button">B</button>`);

export default function Delegated_locally_declared_shadowed($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 0, () => ({ length: 1 }), $.index, ($$anchor, $$item, index) => {
		var button = root_1();

		$.set_attribute(button, 'data-index', index);

		button.__click = (e) => {
			const index = Number(e.currentTarget.dataset.index);

			console.log(index);
		};

		$.append($$anchor, button);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);