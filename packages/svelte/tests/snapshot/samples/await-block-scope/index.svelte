<script>
	let counter = $state({ count: 0 });
	const promise = $derived(Promise.resolve(counter))

	function increment() {
		counter.count += 1;
	}
</script>

<button onclick={increment}>
	clicks: {counter.count}
</button>

{#await promise then counter}{/await}

{counter.count}
