<script>
	export let items = ['foo', 'bar', 'baz'];
	export let divs = [];
</script>

{#each items as item, j}
	<div bind:this={divs[j]}>{item}</div>
{/each}