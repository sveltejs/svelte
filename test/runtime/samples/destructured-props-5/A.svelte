<script>
	import { writable } from "svelte/store";

	let default_b = 5;
	const LIST = [1, 2, 3, { a: 4 }, [5, writable(6), writable(7), 8]];
	export const [
		x,
		,
		...[, { a: list_two_a, b: list_two_b = default_b }, [, ...{ length: y }]]
	] = LIST;
	export let [
		l,
		m,
		,
		...[{ a: n, b: o = default_b }, [p, q, ...[r, ...{ length: s }]]]
	] = LIST;
</script>

<div>
	x: {x}, list_two_a: {list_two_a}, list_two_b: {list_two_b}, y: {y}, l: {l}, m: {m},
	n: {n}, o: {o}, p: {p}, q: {$q}, r: {$r}, s: {s}
</div>
<div>{JSON.stringify(LIST)}</div>
