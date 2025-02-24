import * as $ from 'svelte/internal/server';

export default function Nullish_coallescence_omittance($$payload) {
	let name = 'world';
	let count = 0;

	$$payload.out += `<h1>Hello, ${$.escape(name)}!</h1> <b>123</b> <button>Count is ${$.escape(count)}</button> <h1>Hello, ${$.escape(name ?? 'earth' ?? null)}</h1>`;
}