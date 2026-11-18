<script>
	let go = $state(false);
	let count = $state(0);
	let double = $derived(count * 2);
	let bucket = $derived(Math.floor(count / 10));
	let value = $derived(double * 2);
	let stable = $derived(bucket * 2);

	double = 5;
	bucket = 0;
	value = 100;
	stable = 200;

	$effect(() => {
		go;

		return () => {
			console.log(`before: ${value} ${stable}`);
			count = 2;
			console.log(`after: ${value} ${stable}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	value = 101;
	stable = 201;
}}>go</button>
