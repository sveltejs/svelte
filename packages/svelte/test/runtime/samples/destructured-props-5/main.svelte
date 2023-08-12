<script>
	import A from "./A.svelte";
	import { writable } from "svelte/store";

	let x = "x",
		list_two_a = "list_two_a",
		list_two_b = "list_two_b",
		y = writable("y"),
		l = "l",
		m = "m",
		n = "n",
		o = "o",
		p = "p",
		q = writable("q"),
		r = writable("r"),
		s = "s";

	export function update() {
		x = "XX";
		list_two_a = "LIST_TWO_A";
		list_two_b = "LIST_TWO_B";
		y = writable("YY");
		l = "LL";
		m = "MM";
		n = "NN";
		o = "OO";
		p = "PP";
		q = writable("QQ");
		r = writable("RR");
		s = "SS";
	}
</script>

<A />
<br />
<A {x} {list_two_a} {list_two_b} {y} {l} {m} {n} {o} {p} {q} {r} {s} />
