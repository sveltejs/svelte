<script>
	export let value = 4;
</script>

{#each [value] as n}
	<div>{n} ^ 4 = {hypercubed}</div>

	{@const squared = n * n}
	{@const cubed = squared * n}
	{@const hypercubed = cubed * n}
{/each}