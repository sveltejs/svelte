<script>
	let list = [1, 2, 3];
</script>

<button on:click={event => {
	list = list.map(item => {
		return item * 2;
	});
}}>click me</button>

{#each list as number}
	<p>{number}</p>
{/each}