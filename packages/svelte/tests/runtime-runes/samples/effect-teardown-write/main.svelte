<script>
	let count = $state(0);
	let go = $state(false);

	$effect(() => {
		go;
		return () => {
			count--
			console.log(count);
		};
	});

	$effect(() => {
		go;
		return () => {
			count--
			console.log(count);
		};
	});
</script>

<button onclick={() => {go = true;count=2}}>go</button>
