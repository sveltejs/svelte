<script>
	let value = null;
</script>

<button
	on:click={() => {
		try {
			throw new Error('foo');
		} catch (error) {
			value = error;
		}
	}}>Click to create error</button>

{String(value)}
