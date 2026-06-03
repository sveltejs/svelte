<script>
	let arr = $state([100, 0, 50]);
	let nextValues = [20, 80];
	let valueIndex = 0;

	$effect(() => {
		arr.sort((a, b) => a - b);
	});

	function addItem() {
		if (valueIndex < nextValues.length) {
			arr.push(nextValues[valueIndex]);
			valueIndex++;
		}
	}
</script>

<button onclick={addItem}>add item</button>
{#each arr as x}
	<p>{x}</p>
{/each}
