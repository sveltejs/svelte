<script>
	import Item from './item.svelte'

	let items = $state([{name: 'a'}, {name: 'b'}]);
</script>

<!-- test that each block doesn't mess with item identity -->

{#each items as item (item)}
	<Item {item} {items} onclick={() => item.name = item.name + '+'} />
{/each}

{#each items as item (item.name)}
	<Item {item} {items} onclick={() => {console.log('hello'); item.name = item.name + '+'}} />
{/each}

{#each items as item}
	<Item {item} {items} onclick={() => item.name = item.name + '+'} />
{/each}
