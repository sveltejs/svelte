<script>
	let numbers = $state([1, 2, 3]);
</script>

<button onclick={() => numbers = [4, 5, 6]}>update</button>

{#each numbers as n}
	<p>{n}</p>
{/each}
