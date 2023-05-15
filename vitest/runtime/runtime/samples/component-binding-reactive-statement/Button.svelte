<script>
	export let count
	
	function handleClick() {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	button {count}
</button>