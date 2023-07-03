<script>
	let count = 0;

	$: if (count >= 10) {
		alert(`Le nombre est dangereusement élevé !`);
		count = 9;
	}

	function handleClick() {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	Cliqué {count} fois
</button>