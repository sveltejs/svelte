<script>
	let x = $state(0);
	let y = $state(0);

	$inspect(x, (changed, x) => {
		if (changed) console.log(new Error(), x);
	});
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>
