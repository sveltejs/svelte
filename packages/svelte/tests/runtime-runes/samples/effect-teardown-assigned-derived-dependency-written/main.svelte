<script>
	let go = $state(false);
	let count = $state(0);
	let double = $derived(count * 2);

	double = 10;

	$effect(() => {
		go;

		return () => {
			console.log(`before dependency write: ${double}`);
			count = 2;
			console.log(`after dependency write: ${double}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	double = 20;
	count = 1;
	console.log(`current: ${double}`);
}}>go</button>
