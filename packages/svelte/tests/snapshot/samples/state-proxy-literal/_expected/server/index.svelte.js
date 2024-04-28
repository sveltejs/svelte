import * as $ from "svelte/internal/server";

export default function State_proxy_literal($$payload, $$props) {
	$.push(true);

	let str = '';
	let tpl = ``;

	function reset() {
		str = '';
		str = ``;
		tpl = '';
		tpl = ``;
	}

	$$payload.out += `<input${$.attr("value", str, false)}> <input${$.attr("value", tpl, false)}> <button>reset</button>`;
	$.pop();
}