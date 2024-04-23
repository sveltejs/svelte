<script>
	let s = $state(0);
	let d = $derived(s)

	$effect(() => {
		s;
		console.log('A')
	})

	$effect(() => {
		d;
		console.log('B')
	})
</script>

<h1>{s}</h1>

<button on:click={() =>s++ }>Click</button>
