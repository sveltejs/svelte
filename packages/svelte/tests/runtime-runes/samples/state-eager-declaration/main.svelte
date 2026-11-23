<script>
	let n = $state(2);
	let d = $derived(n * 10);
	let x = $state.eager(d);
</script>

<p>{x}</p>
