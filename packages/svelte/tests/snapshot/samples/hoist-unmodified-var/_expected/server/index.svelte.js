// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

const o = 'o';
const d = 'd';

export default function Hoist_unmodified_var($$payload, $$props) {
	$.push(true);

	let boolean = false;
	let value = 'd';

	value += 'd';
	$$payload.out += `<p${$.attr("autocapitalize", `w${$.stringify(o)}r${$.stringify(d)}s`, false)}${$.attr("itemid", `w${$.stringify(o)}r${$.stringify(value)}s`, false)}${$.attr("contenteditable", boolean, false)}>boolean is ${$.escape(boolean)} and autocapitalize is w${$.escape(o)}r${$.escape(d)}s</p>`;
	$.pop();
}