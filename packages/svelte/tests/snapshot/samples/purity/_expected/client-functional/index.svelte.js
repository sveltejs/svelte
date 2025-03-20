import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.template_fn(
	() => {
		var p = document.createElement('p');
		var text = document.createTextNode(' ');
		var p_1 = document.createElement('p');
		var text_1 = document.createTextNode(' ');
		var comment = document.createComment('');
		var fragment = document.createDocumentFragment();

		fragment.append(p, text, p_1, text_1, comment)
		return fragment;
	},
	1
);

export default function Purity($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = Math.max(0, Math.min(0, 100));

	var p_1 = $.sibling(p, 2);

	p_1.textContent = location.href;

	var node = $.sibling(p_1, 2);

	Child(node, { prop: encodeURIComponent('hello') });
	$.append($$anchor, fragment);
}