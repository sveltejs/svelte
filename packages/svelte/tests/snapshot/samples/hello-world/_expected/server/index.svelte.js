import * as $ from "svelte/internal/server";

export default function Hello_world($$payload) {
	$$payload.out += `<h1>hello world</h1>`;
}