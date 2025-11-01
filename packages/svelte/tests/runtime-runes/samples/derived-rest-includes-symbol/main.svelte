<script>
	const symbol = Symbol();

	let a = { [symbol]: 42 };
	let { ...b } = $derived(a);
</script>

<p>{b[symbol]}</p>
