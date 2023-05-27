<script>
	let dummy = 0;
	function increment () {
		dummy = 1;
	}
</script>

<slot dummy={dummy}></slot>
<button on:click={increment}></button>