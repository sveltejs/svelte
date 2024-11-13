<script>
	let inner = Symbol();
	let outer = $state({ inner });
</script>

<button onclick={() => outer = { inner }}>update</button>

{#key outer.inner}
	{console.log('rendering')}
{/key}
