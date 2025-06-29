<script>
	import { onDestroy } from 'svelte';

	let { checked = $bindable(), count = $bindable() } = $props();

	onDestroy(() => {
		console.log(`${count} ${checked}`);
	});
</script>

<p>Count: {count}</p>
