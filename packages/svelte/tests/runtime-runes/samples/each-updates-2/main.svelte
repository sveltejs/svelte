<script>
	let arr = $state([]);
	let counter = 0

	function addItem() {
		arr.push(`${counter++}`)
	}

	function removeItem(i) {
		arr.splice(i, 1)
	}
</script>

<button onclick={addItem}>Add Item</button>

{#each arr as item, i}
	<button onclick={() => removeItem(i)}>Index {i} | Item {item}</button>
{/each}
