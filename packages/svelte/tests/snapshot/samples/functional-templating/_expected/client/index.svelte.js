import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_tree(
	[
		['h1', null, 'hello'],
		' ',

		[
			'div',
			{ class: 'potato' },
			['p', null, 'child element'],
			' ',
			['p', null, 'another child element']
		]
	],
	1
);

export default function Functional_templating($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}