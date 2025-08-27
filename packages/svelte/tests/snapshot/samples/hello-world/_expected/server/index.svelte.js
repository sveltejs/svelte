import * as $ from 'svelte/internal/server';

export default function Hello_world($$payload) {
	$$payload.child(($$payload) => {
		$$payload.push(`<h1>hello world</h1>`);
	});
}