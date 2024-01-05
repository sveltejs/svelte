<script>
	let data = $state({ items: [] });

	function fetchData() {
		data = {
			items: [{
				id: 1,
				price: 1,
				name: 'test'
			}, {
				id: 2,
				price: 2,
				name: 'test 2'
			}]
		};
	}

	fetchData();

	function copyItems(original) {
    return [...original.map((item) => ({ ...item }))];
  }

  let items = $state();

	$effect(() => {
    items = copyItems(data.items);
  });
</script>

{#each items as item}
  <p>{item.name} costs ${item.price}</p>
{/each}

{#each items as item (item.id)}
  <p>{item.name} costs ${item.price}</p>
{/each}


<button onclick={() => {
	items.push({
		id: 3,
		price: 3,
		name: 'test 3'
	})
}}>add</button>

<button onclick={() => {
	data.items[1].price = 2000
}}>change</button>

<button onclick={() => {
	fetchData();
}}>reload</button>
