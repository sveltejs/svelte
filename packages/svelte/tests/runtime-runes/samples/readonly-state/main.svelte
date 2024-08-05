<script>
	let x = $state.raw(0);
	let y = $state.raw(0);

	$effect(() => {
		console.log(x);
	});
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>
