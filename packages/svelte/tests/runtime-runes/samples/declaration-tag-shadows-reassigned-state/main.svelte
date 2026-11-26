<script>
	let count = $state.raw(0);
</script>

<button onclick={() => (count += 1)}>{count}</button>

{#if true}
	{let count = $state.raw(9)}
	<p>{count}</p>
{/if}
