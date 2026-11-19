<script>
	let edited = $state(null);
	let untouched = $state(null);
</script>

<input type="color" bind:value={edited} />
<input type="color" bind:value={untouched} />

<p>{JSON.stringify([edited, untouched])}</p>
