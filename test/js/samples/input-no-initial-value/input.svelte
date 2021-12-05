<script>
	let test = undefined;

	function handleSubmit(event) {
		event.preventDefault();
		console.log('value', test);
	}
</script>

<form on:submit={handleSubmit}>
	<input bind:value={test} type=text required>
	<button>Store</button>
</form>