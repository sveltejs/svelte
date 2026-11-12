<script>
	let count = $state(0, {
		onchange() {
			console.log('count', count);
			count = Math.min(count, 10);
		}
	});

	let items = $state([], {
		onchange() {
			console.log('items', items.length);
			if (items.length > 2) items.length = 2;
		}
	});
</script>

<button onclick={() => (count = 20)}>{count}</button>
<button onclick={() => items.push(1, 2, 3)}>{items.length}</button>
