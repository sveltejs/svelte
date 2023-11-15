// input.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Input($$payload, $$props) {
	$.push(false);

	function log() {
		console.log(snippet);
	}

	function snippet($$payload) {
		const anchor = $.create_anchor($$payload);

		$$payload.out += anchor;
		$$payload.out += `Hello`;
		$$payload.out += anchor;
	}

	$$payload.out += `<button>log snippet</button>`;
	$.pop();
}