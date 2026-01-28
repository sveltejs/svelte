import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <!> `, 1);

export default function Await_block_scope($$anchor) {
	let counter = $.proxy({ count: 0 });
	const promise = $.derived(() => Promise.resolve(counter));

	function increment() {
		counter.count += 1;
	}

	var fragment = root();
	var button = $.first_child(fragment);

	button.__click = increment;

	var text = $.child(button);

	$.reset(button);

	var node = $.sibling(button, 2);

	$.await(node, () => $.get(promise), null, ($$anchor, counter) => {});

	var text_1 = $.sibling(node);

	$.template_effect(() => {
		$.set_text(text, `clicks: ${counter.count ?? ''}`);
		$.set_text(text_1, ` ${counter.count ?? ''}`);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);