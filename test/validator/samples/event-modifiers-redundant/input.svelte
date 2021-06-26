<script>
	function handleTouchstart() {
		// ...
	}

	function handleClick() {
		// ...
	}
</script>

<button on:click|passive={handleClick} />
<div on:touchstart|passive={handleTouchstart} />
