import * as $ from 'svelte/internal/server';

export default function Purity($$payload) {
	$$payload.out += `<p>0</p> <p>${$.escape(location.href)}</p> `;
	Child($$payload, { prop: encodeURIComponent('hello') });
	$$payload.out += `<!---->`;
}