import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

export default function Typescript_optional_parameter($$anchor) {
	// the `?` on the optional parameter must be stripped, but optional chaining
	// (`x?.length`, `o?.b`) must be preserved
	function a(x) {
		return x?.length;
	}

	const o = {};
	const v = o?.b?.c;

	a();
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, v));
	$.append($$anchor, text);
}