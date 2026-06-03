<script>
	let { data } = $props();
</script>

{#each data.obj.arr as i}
	<p>{i}</p>
{/each}