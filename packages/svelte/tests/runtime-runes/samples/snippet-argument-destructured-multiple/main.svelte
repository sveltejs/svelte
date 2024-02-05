<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

{#snippet foo({ count }, { doubled })}
	<p>clicks: {count}, doubled: {doubled}</p>
{/snippet}

{@render foo({ count }, { doubled })}

<button on:click={() => count += 1}>
	click me
</button>
