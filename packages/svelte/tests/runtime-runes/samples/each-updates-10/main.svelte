<script>
	const items = $state([{ t: 0 }]);
</script>

<button onclick={() => items.unshift({t:items.length})}>add</button>
<button onclick={() => items.at(-1).t = 10}>adjust</button>
 
<h2>Keyed</h2>
{#each items as item, index (item)}
	<div>Item: {item.t}. Index: {index}</div>
{/each}

<h2>Unkeyed</h2>
{#each items as item, index}
	<div>Item: {item.t}. Index: {index}</div>
{/each}
