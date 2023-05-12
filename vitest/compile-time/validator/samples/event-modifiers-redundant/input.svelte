<script>
	function handleTouchstart() {
		// ...
	}

	function handleClick() {
		// ...
	}
</script>

<button on:click|passive="{handleClick}"></button>
<div on:touchstart|passive="{handleTouchstart}"></div>