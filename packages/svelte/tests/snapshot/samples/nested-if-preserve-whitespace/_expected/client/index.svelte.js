import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root_1 = $.from_html(
	`
		<!>
	`,
	1
);

var root = $.from_html(
	`

<p>
	<!>
</p>`,
	1
);

export default function Nested_if_preserve_whitespace($$anchor) {
	let visible = true;
	let childVisible = true;

	$.next();

	var fragment = root();
	var p = $.sibling($.first_child(fragment));
	var node = $.sibling($.child(p));

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.sibling($.first_child(fragment_1));

			{
				var consequent = ($$anchor) => {
					var text = $.text('\n			child\n		');

					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if (childVisible) $$render(consequent);
				});
			}

			$.next();
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent_1);
		});
	}

	$.next();
	$.reset(p);
	$.append($$anchor, fragment);
}