import * as $ from "svelte/internal/server";

export default function Purity($$payload) {
	let min = 0;
	let max = 100;
	let number = 50;
	let value = 'hello';

	$$payload.out += `<p>${$.escape(Math.max(min, Math.min(max, number)))}</p> <p>${$.escape(location.href)}</p> `;
	Child($$payload, { prop: encodeURIComponent(value) });
	$$payload.out += `<!---->`;
}