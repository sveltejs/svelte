<script>
	import { onDestroy } from 'svelte';

	let { label, read } = $props();

	onDestroy(() => console.log([label, ...read()]));
</script>

<p>{label}</p>
