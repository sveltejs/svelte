import * as $ from 'svelte/internal/server';

export default function Purity($$renderer) {
	$$renderer.push(`<p>0</p> <p>${$.escape(location.href)}</p> `);
	Child($$renderer, { prop: encodeURIComponent('hello') });
	$$renderer.push(`<!---->`);
}