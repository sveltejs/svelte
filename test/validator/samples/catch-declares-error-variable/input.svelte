<script>
	let value = null;
</script>

<button on:click={event => {
	try {
		throw new Error('foo');
	} catch (error) {
		value = error;
	}
}}>Click to create error</button>

{String(value)}
