// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";

export default function Directives_with_member_access($$payload, $$props) {
	$.push(false);

	const one = () => {};
	const nested = { one };
	const evenmore = { nested };

	$$payload.out += `<div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div>`;
	$.pop();
}