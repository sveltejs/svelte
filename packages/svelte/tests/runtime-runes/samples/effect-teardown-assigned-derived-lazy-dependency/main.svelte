<script>
	let go = $state(false);
	let count = $state(0);
	let double = $derived(count * 2);
	let quadruple = $derived(double * 2);

	quadruple = 10;

	$effect(() => {
		go;

		return () => {
			console.log(`before dependency write: ${quadruple}`);
			count = 2;
			console.log(`after dependency write: ${quadruple}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	quadruple = 20;
	count = 1;
}}>go</button>
