<script>
	import { flushSync } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);

	$effect(() => {
		b = a * 2;
	});

	$effect(() => {
		if (c === 0) return;
		b = c;
		flushSync();
	});
</script>

<button onclick={() => a++}>{a} {b}</button>
<button onclick={() => c++}>{c}</button>
