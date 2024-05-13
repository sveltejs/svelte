import * as $ from "svelte/internal/server";

export default function Hello_world($$payload, $$props) {
	$.push(false);
	$$payload.out += `<h1>hello world</h1>`;
	$.pop();
}