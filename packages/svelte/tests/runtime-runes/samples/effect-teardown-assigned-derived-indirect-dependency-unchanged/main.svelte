<script>
	let go = $state(false);
	let count = $state(0);
	let bucket = $derived(Math.floor(count / 10));
	let value = $derived(bucket * 2);

	value = 10;

	$effect(() => {
		go;

		return () => {
			console.log(`before dependency write: ${value}`);
			count = 2;
			console.log(`after dependency write: ${value}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	value = 20;
	count = 1;
	console.log(`current: ${value}`);
}}>go</button>
