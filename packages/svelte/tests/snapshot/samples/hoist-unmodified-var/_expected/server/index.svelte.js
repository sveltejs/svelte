// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

const autocapitalize = 'words';

export default function Hoist_unmodified_var($$payload, $$props) {
	$.push(true);

	let boolean = false;

	$$payload.out += `<p${$.attr("autocapitalize", autocapitalize, false)}${$.attr("contenteditable", boolean, false)}>boolean is ${$.escape(boolean)} and autocapitalize is $${$.escape(autocapitalize)}</p>`;
	$.pop();
}