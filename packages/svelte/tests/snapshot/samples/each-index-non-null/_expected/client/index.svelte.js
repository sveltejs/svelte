import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root_1 = $.from_html(`<p></p>`);

export default function Each_index_non_null($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 0, () => Array(10), $.index, ($$anchor, $$item, i) => {
		var p = root_1();

		p.textContent = `index: ${i}`;
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}