// main.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import * as $ from "svelte/internal/server";
import { writable } from 'svelte/store';

export default function Main($$payload, $$props) {
	$.push(false);

	const $$store_subs = {};
	const animate = writable();

	$$payload.out += `<div>Hello!</div> <div>Hello!</div>`;
	$.unsubscribe_stores($$store_subs);
	$.pop();
}