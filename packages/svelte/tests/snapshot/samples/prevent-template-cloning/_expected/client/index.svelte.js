import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

function increment(_, counter) {
	counter.count += 1;
}

var root = () => {
	var button = document.createElement('button');
	var text = document.createTextNode(' ');

	button.insertBefore(text, undefined)

	var text_1 = document.createTextNode(' ');
	var comment = document.createComment('');
	var text_2 = document.createTextNode(' ');
	var fragment = document.createDocumentFragment();

	fragment.append(button, text_1, comment, text_2)
	return fragment;
};

export default function Prevent_template_cloning($$anchor) {
	let counter = $.proxy({ count: 0 });
	const promise = $.derived(() => Promise.resolve(counter));
	var fragment = root();
	var button = $.first_child(fragment);

	button.__click = [increment, counter];

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