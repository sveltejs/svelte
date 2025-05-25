import * as $ from 'svelte/internal/server';

export default function Destructure_derived_arrays($$payload) {
	let { a, b, c } = {};
	let [d, e, f] = [];
	let { g, h, i: [j] } = [];
	let { k, l, m: { n: [o] } } = [];
}