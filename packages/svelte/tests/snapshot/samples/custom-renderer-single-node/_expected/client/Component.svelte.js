import $renderer from 'my-custom-renderer';
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component($$anchor, $$props) {
	var $$pop_renderer = $.push_renderer($renderer);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.validate_snippet_renderer($renderer, $$props.children) ?? $.noop);
	$.append($$anchor, fragment);
	$$pop_renderer();
}