import * as $ from 'svelte/internal/server';

export default function Derived_forward_ref_leading_comments($$renderer) {
	const ctx = {
		get later() {
			return later();
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	const later = $.derived(() => 'LATER');

	$$renderer.push(`<p>${$.escape(ctx.later)}</p>`);
}