<script>
	let count = $state(0);
	let even = $derived.by(() => {
		return count > 0 ? even : 0;
	})

</script>

<button onclick={() => count++}>increment</button>

{even}
