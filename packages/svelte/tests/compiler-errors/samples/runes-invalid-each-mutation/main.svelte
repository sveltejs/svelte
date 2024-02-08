<script>
	let arr = $state([1,2,3]);
</script>

{#each arr as value}
			<button onclick={() => value += 1}>click</button>
{/each}
