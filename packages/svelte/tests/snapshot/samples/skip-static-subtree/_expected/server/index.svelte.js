import * as $ from "svelte/internal/server";

export default function Skip_static_subtree($$payload) {
	$$payload.out += `<header><nav><a href="/">Home</a> <a href="/away">Away</a></nav></header>`;
}