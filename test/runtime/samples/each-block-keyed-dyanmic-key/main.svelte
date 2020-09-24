<script>
	export let id = 0;
	export let value;
</script>

{#each ['foo', 'bar'] as key (id + key)}
	<div>{value()}</div>
{/each}