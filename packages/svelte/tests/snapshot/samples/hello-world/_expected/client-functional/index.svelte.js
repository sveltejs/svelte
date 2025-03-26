import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.template_fn([{ e: 'h1', c: ['hello world'] }]);

export default function Hello_world($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}