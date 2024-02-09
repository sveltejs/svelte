<script>
	let arr = $state([1,2,3]);
</script>

{#each arr as value}
	<input bind:value>
{/each}
