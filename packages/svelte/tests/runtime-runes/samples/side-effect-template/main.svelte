<script>
	let items = $state([]);
</script>

<button onclick={() => items.push(3, 2, 1)}>Add</button>
{JSON.stringify(items.sort())}
