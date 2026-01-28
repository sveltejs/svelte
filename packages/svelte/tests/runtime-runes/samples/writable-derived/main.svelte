<script>
	let count = $state(0);
	let double = $derived(count * 2);
</script>

<input type="range" bind:value={count} />
<input type="range" bind:value={double} />

<p>{count} * 2 = {double}</p>
