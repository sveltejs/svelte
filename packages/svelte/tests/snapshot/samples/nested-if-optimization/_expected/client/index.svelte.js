import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root_2 = $.from_svg(`<path></path>`);
var root = $.from_svg(`<svg><!></svg>`);

export default function Nested_if_optimization($$anchor) {
	let iconData = $.proxy({ paths: [{ d: 'M0 0' }] });
	var svg = root();
	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => iconData.paths, $.index, ($$anchor, path) => {
				var path_1 = root_2();

				$.attribute_effect(path_1, () => ({ ...$.get(path) }));
				$.append($$anchor, path_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (iconData && iconData.paths) $$render(consequent);
		});
	}

	$.reset(svg);
	$.append($$anchor, svg);
}