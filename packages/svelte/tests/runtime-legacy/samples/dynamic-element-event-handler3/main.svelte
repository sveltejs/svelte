<script>
	let makeHandler = null;
	makeHandler = () => {
		console.log('create');
		return () => console.log('trigger');
	};
</script>

<button on:click={makeHandler()}>Click</button>
