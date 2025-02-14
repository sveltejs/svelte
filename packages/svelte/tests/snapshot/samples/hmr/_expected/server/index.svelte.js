import * as $ from 'svelte/internal/server';

export default function Hmr($$payload) {
	const $$cleanup = $.setup($$payload);

	$$payload.out += `<h1>hello world</h1>`;
	$$cleanup($$payload);
}