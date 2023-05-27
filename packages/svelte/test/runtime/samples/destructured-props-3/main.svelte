<script>
	import A from './A.svelte';
	import { writable } from 'svelte/store';

	let i = 'i',
		k = writable('k'),
		l = 'l',
		n = writable('n'),
		a = 'a',
		c = writable('c'),
		d = 'd',
		f = writable('f');

	export function update() {
		i = 'ii';
		k = writable('kk');
		l = 'll';
		n = writable('nn');
		a = 'aa';
		c = writable('cc');
		d = 'dd';
		f = writable('ff');
	}

</script>

<A />
<br />
<A {i} {k} {l} {n} {a} {c} {d} {f} />
