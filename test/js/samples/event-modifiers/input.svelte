<script>
	function handleTouchstart() {
		// ...
	}

	function handleClick() {
		// ...
	}
</script>

<div on:touchstart={handleTouchstart}>
	<div on:touchstart|nonpassive={handleTouchstart}>touch me</div>
	<button on:click|stopPropagation|preventDefault={handleClick}>click me</button>
	<button on:click|once|capture={handleClick}>or me</button>
	<button on:click|capture={handleClick}>or me!</button>
</div>