<script>
	let x = $state(0);
	let y = $state(0);

	function getX() {
		console.log('x')
		return x;
	}

	function getY() {
		console.log('y')
		return y;
	}
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>

{getX()}|{getY()}
