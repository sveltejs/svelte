<script>
	import { flushSync } from 'svelte';

	let x = $state(0);

	$effect(() => {
		if (x === 0) {
			x = 1;
			flushSync();
		}
	});
</script>

<p>x = {x}</p>
