<script>
	let checked = $state(false);
	let text = $state('');
</script>

<form onreset={(e) => e.preventDefault()}>
	<input type="checkbox" bind:checked />
	<input bind:value={text} />
	<button type="button" onclick={(e) => e.currentTarget.form?.reset()}>Reset</button>
</form>

<p>{JSON.stringify({ checked, text })}</p>
