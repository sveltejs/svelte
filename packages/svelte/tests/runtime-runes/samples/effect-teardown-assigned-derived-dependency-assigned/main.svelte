<script>
	let go = $state(false);
	let count = $state(0);
	let double = $derived(count * 2);
	let quadruple = $derived(double * 2);

	quadruple = 10;

	$effect(() => {
		go;

		return () => {
			console.log(`before dependency assignment: ${quadruple}`);
			double = 7;
			console.log(`after dependency assignment: ${quadruple}`);
		};
	});
</script>

<button onclick={() => {
	go = true;
	quadruple = 20;
}}>go</button>
