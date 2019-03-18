<script>
	import { writable } from '../../../../store.js';

	const a = writable();
	const b = writable();
	export let c;

	$: $a = $b;
	$: $b = $c;

	function increment() {
		$c += 1;
	}
</script>

<p>a: {$a}</p>
<p>b: {$b}</p>
<p>c: {$c}</p>

<button on:click={increment}>+1</button>