<script>
	let go = $state(false);
	let x = $state(0);
	let count = $state(0);
	let double = $derived(count * 2);

	double = 10;

	$effect(() => {
		go;

		return () => {
			console.log(`before: ${x} ${double}`);
			x = 1;
			double = 20;
			console.log(`after: ${x} ${double}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	x = 1;
	double = 20;
}}>go</button>
