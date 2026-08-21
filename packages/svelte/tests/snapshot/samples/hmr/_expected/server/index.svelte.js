import * as $ from 'svelte/internal/server';

export default function Hmr($$renderer) {
	$$renderer.push(`<h1>hello world</h1>`);
}