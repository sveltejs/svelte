<script>
	export const items1 = {};
	export const items2 = {};
	export let data = [
		{id: 1, text: "b"},
		{id: 2, text: "c"},
	];
</script>

{#each data as item (item.id)}
	<div bind:this={items1[item.id]}>{item.text}</div>
	<div bind:this={items2[item.id]}>{item.text}</div>
{/each}
