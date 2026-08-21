import * as $ from 'svelte/internal/server';

export default function Hello_world($$renderer) {
	$$renderer.push(`<h1>hello world</h1>`);
}