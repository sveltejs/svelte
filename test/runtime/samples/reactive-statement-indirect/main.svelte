<script>
	let count = 1;
	// Could be a let or simplified, but this tests that it still works like this
	$: indirect_double = 2;
	$: if (count > 0) {
		indirect_double = count * 2;
	}
</script>

<h1>{indirect_double}</h1>
<button on:click={() => count++}>Increment</button>
