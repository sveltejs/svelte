import * as $ from 'svelte/internal/server';

export default function Nullish_coallescence_omittance($$renderer) {
	let name = 'world';
	let count = 0;

	$$renderer.push(`<h1>Hello, world!</h1> <b>123</b> <button>Count is ${$.escape(count)}</button> <h1>Hello, world</h1>`);
}