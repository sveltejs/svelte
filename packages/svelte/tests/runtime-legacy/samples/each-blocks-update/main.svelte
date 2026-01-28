<script>
	let arr = [1, 2, 3];
</script>

{#each arr as n}
	<button on:click={() => n++}>{n}</button>
{/each}

<p>{arr.join(', ')}</p>
