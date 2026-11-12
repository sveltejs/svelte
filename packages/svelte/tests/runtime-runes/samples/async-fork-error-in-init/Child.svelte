<script>
	function throw_error() {
		throw new Error('nope');
	}

	let a = $derived(await throw_error());
	let b = $derived(await a);
	let c = $derived(await b);
</script>

<p>{a} {b} {c}</p>
