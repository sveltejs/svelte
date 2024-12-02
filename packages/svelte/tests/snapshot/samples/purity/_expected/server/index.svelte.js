import * as $ from "svelte/internal/server";

export default function Purity($$payload) {
	$$payload.out += `<p>${$.escape(Math.max(0, Math.min(0, 100)))}</p> <p>${$.escape(location.href)}</p> `;
	Child($$payload, { prop: encodeURIComponent('hello') });
	$$payload.out += `<!---->`;
}