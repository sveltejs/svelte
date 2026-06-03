import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Props_identifier($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	$$props.a;
	props[a];
	$$props.a.b;
	$$props.a.b = true;
	props.a = true;
	props[a] = true;
	props;
	$.pop();
}