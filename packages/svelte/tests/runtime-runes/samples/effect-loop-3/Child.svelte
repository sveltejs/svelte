<script>
	let { children } = $props();

	let inited = $state(false);

	$effect(() => {
		inited = true;
	});
</script>

{#if inited}
	<span>{@render children()}</span>
{/if}
