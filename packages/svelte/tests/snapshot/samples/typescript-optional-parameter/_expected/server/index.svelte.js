import * as $ from 'svelte/internal/server';

export default function Typescript_optional_parameter($$renderer) {
	// the `?` on the optional parameter must be stripped, but optional chaining
	// (`x?.length`, `o?.b`) must be preserved
	function a(x) {
		return x?.length;
	}

	const o = {};
	const v = o?.b?.c;

	a();
	$$renderer.push(`<!---->${$.escape(v)}`);
}