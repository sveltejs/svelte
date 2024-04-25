import * as $ from "svelte/internal/server";

export default function Main($$payload, $$props) {
	$.push(true);

	// needs to be a snapshot test because jsdom does auto-correct the attribute casing
	let x = 'test';
	let y = () => 'test';

	$$payload.out += `<div${$.attr("foobar", x, false)}></div> <svg${$.attr("viewBox", x, false)}></svg> <custom-element${$.attr("foobar", x, false)}></custom-element> <div${$.attr("foobar", y(), false)}></div> <svg${$.attr("viewBox", y(), false)}></svg> <custom-element${$.attr("foobar", y(), false)}></custom-element>`;
	$.pop();
}