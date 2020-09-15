<script>
	import { writable } from 'svelte/store';

	let eid = writable(1);
	let foo;
	let u;
	let v;
	let w;
	[u, v, w] = [
		{id: eid = writable(foo = 2), name: 'xxx'},
		5,
		writable(6)
	];
</script>

<h1>{foo} {$eid} {u.name} {v} {$w}</h1>
