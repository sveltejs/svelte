<script>
	import Child from './Child.svelte';

	let count = $state(0);
	let show = $state(true);

	$effect(() => {
		if (count > 0) show = false;
	});
</script>

<button onclick={() => count++}>increment</button>

{#if show}
	<Child getCount={() => count} isShown={() => show} />
{/if}
