import * as $ from "svelte/internal/server";

export default function State_is($$payload) {
	const obj = {};
	const a = obj;
	const b = obj;

	a === obj;
	Object.is(a, obj);
	a === b;
	Object.is(a, b);
}