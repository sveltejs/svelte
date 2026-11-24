<script>
	import List from "./List.svelte"
	
	let data = $state({things: [{id:1}, {id:2}]})
	
  function reloadData() {
		data = null
	}
</script>

{#if data}
  <List things={data.things.map((t) => t)} />
{/if}

<button onclick={() => reloadData()}>clear</button>
