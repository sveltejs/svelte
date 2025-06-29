<script>
	import { onDestroy } from 'svelte';

	let { checked, count } = $props();

	onDestroy(() => {
		console.log(`${count} ${checked}`);
	});
</script>

<p>Count: {count}</p>
