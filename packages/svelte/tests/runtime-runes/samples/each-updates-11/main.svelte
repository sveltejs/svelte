<script>
	let list = $state([{ id: 1, text: '1' }, { id: 2, text: '2' }, { id: 3, text: '3' }]);
</script>

<button onclick={() => list = [list[0], { id: 4, text: '4' }, ...list.slice(1)]}>add 4</button>
<button onclick={() => list = [list[0], list[1], { id: 5, text: '5' }, ...list.slice(2)]}>add 5</button>
<button onclick={() => list.at(-1).text = 'updated'}>modify 3</button>

{#each list as item (item.id)}
	{item.text}
{/each}
