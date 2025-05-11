import * as $ from 'svelte/internal/server';

export default function Bidirectional_control_chars($$payload) {
	let name = '\u2067\u2066rld\u2069\u2066wo\u2069\u2069';

	$$payload.out += `<!---->⁧⁦def⁩⁦abc⁩⁩ <h1>Hello, ⁧⁦rld⁩⁦wo⁩⁩!</h1>`;
}