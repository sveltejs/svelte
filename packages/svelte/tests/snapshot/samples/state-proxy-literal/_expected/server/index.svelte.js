import * as $ from "svelte/internal/server";

export default function State_proxy_literal($$payload) {
	let str = '';
	let tpl = ``;

	function reset() {
		str = '';
		str = ``;
		tpl = '';
		tpl = ``;
	}

	$$payload.out += `<input${$.attr("value", str)}> <input${$.attr("value", tpl)}> <button>reset</button>`;
}