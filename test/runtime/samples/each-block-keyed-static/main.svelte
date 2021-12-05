<script>
	export let x;
</script>

{#each x as y (y.z)}
	<p>does not change</p>
{/each}
