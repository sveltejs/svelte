<script>
	export const items1 = {};
	export const items2 = {};
	var data = [
		{id: 1, text: "a"},
		{id: 2, text: "b"},
	];
</script>

{#each data as {id, text} (id)}
	<div bind:this={items1[id]}>{text}</div>
	<div bind:this={items2[id]}>{text}</div>
{/each}
