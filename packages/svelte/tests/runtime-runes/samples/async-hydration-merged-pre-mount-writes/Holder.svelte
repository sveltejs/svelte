<script>
	let { tree } = $props();

	function hold(data) {
		return new Promise(() => {});
	}
</script>

<svelte:boundary>
	{#snippet pending()}holding{/snippet}
	{await hold(tree.data)}
</svelte:boundary>
