<script>
	let count = $state(0);
	let disabled = $state(false);

	let even = $derived.by(() => {
		if (disabled) return even;

		return count % 2 === 0;
	})

	function increment() {
		count += 1;
	}
</script>

<p>Is {even ? 'even' : 'odd'}</p>

<button onclick={increment}>
	clicks: {count}
</button>

<label>
	<input type="checkbox" bind:checked={disabled} />

	Disable
</label>
