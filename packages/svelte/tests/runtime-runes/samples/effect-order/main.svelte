<script>
	const {log} = $props();

	let s = $state(0);
	let d = $derived(s)

	$effect(() => {
		s;
		log.push('A')
	})

	$effect(() => {
		d;
		log.push('B')
	})
</script>

<h1>{s}</h1>

<button on:click={() =>s++ }>Click</button>
