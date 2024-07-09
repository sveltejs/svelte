<script>
  let frozen_items = $state.frozen([
		{id: 0, text: 'a'},
		{id: 1, text: 'b'},
		{id: 2, text: 'c'}
	])
</script>

{#each frozen_items as item (item.id)}
	{console.log(item.text)}
  {item.text}
{/each}

<button onclick={() => {
	frozen_items = [...frozen_items, {id: 3, text: 'd'}]
}}></button>
