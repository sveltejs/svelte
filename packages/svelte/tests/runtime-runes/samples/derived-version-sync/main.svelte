<script>
	let trigger = $state(false)
	let index = 0;

	let a = $derived.by(() => {
		trigger;
		const value = [1,2,1][index++%3];
		console.log("a", { value });
		return value
	})

	let b = $derived.by(() => {
		console.log("b", { a });
		return a;
	});

	let c = $derived.by(() => {
		console.log("c", { b });
		return undefined;
	});

	$effect(() => {
		c;
		console.log('effect')
	});
</script>

<button onclick={() => trigger = !trigger}>invalidate</button>
