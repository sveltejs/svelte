<script>
	import { writable } from 'svelte/store';

	let eid = writable(1);
	let foo;
	let u;
	let v;
	let w;
	let x;
	let y;
	[u, v, w] = [
		{id: eid = writable(foo = 2), name: 'xxx'},
		5,
		writable(6)
	];
	({ a: x, b: y } = { a: writable(9), b: writable(10) });
	$: z = u.id;

	export function update() {
		[u, v, w] = [
			{id: eid = writable(foo = 11), name: 'yyy'},
			12,
			writable(13)
		];
		({ a: x, b: y } = { a: writable(14), b: writable(15) });
	}
</script>

<h1>{foo} {$eid} {u.name} {v} {$w} {$x} {$y} {$z}</h1>
