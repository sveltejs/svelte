import $renderer from 'my-custom-renderer';
import 'svelte/internal/flags/custom-renderer';
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_tree([['div', { class: 'greeting' }, ' ']]);

export default function Main($$anchor, $$props) {
	if ($.is_crossing($renderer)) return $.cross($renderer, $$anchor, ($$anchor) => Main($$anchor, $$props));

	var $$previous_renderer = $.push_renderer($renderer);

	try {
		let name = $.prop($$props, 'name', 3, 'world');
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `Hello ${name() ?? ''}!`));
		$.append($$anchor, div);
	} finally {
		$.pop_renderer($$previous_renderer);
	}
}