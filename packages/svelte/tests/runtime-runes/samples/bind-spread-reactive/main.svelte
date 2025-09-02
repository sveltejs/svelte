<script>
	let state = $state(false);
	let value = $state('hello')

	function binding(state) {
		console.log(state);

		return [
			() => value,
			(v) => value = v
		];
	}
</script>

<input bind:value={...binding(state)} />

<button onclick={() => (state = !state)}>Toggle</button>
