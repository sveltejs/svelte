<svelte:options runes={true} />
<script>
	let count = $state(42);
</script>

<p class="explicit-runes">{count}</p>
