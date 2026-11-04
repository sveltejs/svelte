<script>
	let x = $state(0);

	$effect(() => {
		if (x === 1) x = 2;
	});

	$effect(() => {
		console.log(`x ${x}`);
	});
</script>

<button onclick={() => x++}>x</button>
