import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Derived_forward_ref_leading_comments($$anchor) {
	const ctx = {
		get later() {
			return $.get(later);
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	const later = $.derived(() => 'LATER');

	var p = root();
	var text = $.child(p, true);

	$.reset(p);
	$.template_effect(() => $.set_text(text, ctx.later));
	$.append($$anchor, p);
}