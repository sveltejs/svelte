import * as $ from 'svelte/internal/server';

export default function Nullish_coallescence_omittance($$payload) {
	let name = 'world';
	let count = 0;

	$$payload.out += `<h1>Hello, ${$.escape(name)}!</h1> <b>${$.escape(1 ?? 'stuff')}${$.escape(2 ?? 'more stuff')}${$.escape(3 ?? 'even more stuff')}</b> <button>Count is ${$.escape(count)}</button> <h1>Hello, ${$.escape(name ?? 'earth' ?? null)}</h1>`;
}