<script>
	let foo = $state(false)
	let bar = $derived(foo)

	$effect(() => {
		console.log('up', { foo, bar });

		return () =>{
			console.log('down', { foo, bar });
		};
	});
</script>

<button onclick={() => foo = !foo}>toggle ({foo})</button>
