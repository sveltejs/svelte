<script>
	let go = $state(false);
	let count = $state(0);
	let double = $derived(count * 2);
	let unrelated = $state(0);

	double = 10;

	$effect(() => {
		go;

		return () => {
			console.log(`before unrelated write: ${double}`);
			unrelated = 1;
			console.log(`after unrelated write: ${double}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	double = 20;
	count = 1;
	console.log(`current: ${double}`);
}}>go</button>

<p>{unrelated}</p>
