<script>
	let { a, b, push } = $props();

	let d = $derived((await push('d', a + b)) > 0 ? 'positive' : 'zero');
	let e = $derived(await push('e', b));

	$inspect(d).with((type, value) => console.log(`${type}: ${value}`));
</script>

<p>{d} {e}</p>
