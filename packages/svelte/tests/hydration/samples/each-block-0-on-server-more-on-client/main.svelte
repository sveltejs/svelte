<script>
	let { items } = $props();
</script>

<ul>
	{#each items as item}
		<li>{item.name}</li>
	{/each}
</ul>
<ul>
	{#each items as item (item)}
		<li>{item.name}</li>
	{/each}
</ul>
<ul>
	{#each items as item (item.name)}
		<li>{item.name}</li>
	{/each}
</ul>

{#each items as item}
	<li>{item.name}</li>
	<li>{item.name}</li>
{/each}
{#each items as item (item)}
	<li>{item.name}</li>
	<li>{item.name}</li>
{/each}
{#each items as item (item.name)}
	<li>{item.name}</li>
	<li>{item.name}</li>
{/each}
