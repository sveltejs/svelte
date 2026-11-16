<script lang="ts">
	import { onMount } from 'svelte';
	let { input, load }: { input: number; load: (value: number) => Promise<number> } = $props();
	function register() {
		onMount(() => {
			console.log('mounted');
			return () => console.log('destroyed');
		});
	}
	const value = $derived(await load(input));
	register();
</script>
<p>{value}</p>
