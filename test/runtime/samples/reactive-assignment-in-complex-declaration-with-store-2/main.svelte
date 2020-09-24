<script>
	import { writable } from 'svelte/store';

	let eid = writable(1);
	let foo;
	let u = writable(2);
	let v = writable(3);
	let w = writable(4);
	let x = writable(5);
	let y = writable(6);
	[$u, $v, $w] = [
		{id: eid = writable(foo = 2), name: 'xxx'},
		5,
		6
	];
	({ a: $x, b: $y } = { a: 9, b: 10 });
	$: z = $u.id;

	export function update() {
		[$u, $v, $w] = [
			{id: eid = writable(foo = 11), name: 'yyy'},
			12,
			13
		];
		({ a: $x, b: $y } = { a: 14, b: 15 });
	}
</script>

<h1>{foo} {$eid} {$u.name} {$v} {$w} {$x} {$y} {$z}</h1>
