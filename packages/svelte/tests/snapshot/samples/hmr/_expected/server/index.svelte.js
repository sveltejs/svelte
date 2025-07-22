import * as $ from 'svelte/internal/server';

export default function Hmr($$payload) {
	$$payload.out.push(`<h1>hello world</h1>`);
}