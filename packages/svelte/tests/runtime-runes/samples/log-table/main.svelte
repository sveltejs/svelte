<script>
	let x = $state(0);
	let y = $state(0);

	$log.table(x);
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>
