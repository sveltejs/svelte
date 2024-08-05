<script>
	let count = $state(0);
	let disabled = $state(false);

	let even = $derived.by(() => {
		if (disabled) return definitely_even;

		return count % 2 === 0;
	});


	let definitely_even = $derived(even);

	function increment() {
		count += 1;
	}
</script>

<p>Is {even ? 'even' : 'odd'}</p>

<button onclick={increment}>clicks: {count}</button>
<button onclick={() => disabled = true}>disable</button>
