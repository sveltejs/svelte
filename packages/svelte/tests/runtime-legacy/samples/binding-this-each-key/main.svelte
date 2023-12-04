<script>
	export let data = [ { id: '1' }, { id: '2' }, { id: '3' } ];

	export let refs = [];

	// note that this is NOT data.slice().reverse()
	// as that wouldn't have triggered an infinite loop
	$: list = data.reverse();
</script>

{#each list as { id }, index (id)}
	<div bind:this={refs[index]}>
		content {index} {id} {data[index].id}
	</div>
{/each}
