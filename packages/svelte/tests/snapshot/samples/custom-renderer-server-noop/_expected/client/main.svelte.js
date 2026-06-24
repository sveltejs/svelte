import $renderer from 'my-custom-renderer';
import 'svelte/internal/flags/custom-renderer';
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_tree([['div', { class: 'greeting' }, ' ']]);

export default function Main($$anchor, $$props) {
	var $$pop_renderer = $.push_renderer($renderer);
	let name = $.prop($$props, 'name', 3, 'world');
	var div = root();
	var text = $.child(div);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Hello ${name() ?? ''}!`));
	$.append($$anchor, div);
	$$pop_renderer();
}