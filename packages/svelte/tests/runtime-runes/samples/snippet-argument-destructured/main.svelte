<script>
	let count = $state(0);
</script>

{#snippet foo({ count })}
	<p>clicks: {count}</p>
{/snippet}

{@render foo({ count })}

<button on:click={() => count += 1}>
	click me
</button>
