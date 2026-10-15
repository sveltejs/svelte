<script>
	let { x, s, slow, log } = $props();

	// async result of x; `d` only flips when it crosses 0, so incrementing x doesn't change it
	let sx = $derived(await slow(x));
	let d = $derived(sx > 0);

	$effect(() => {
		log(`${s}/${d}`);
	});
</script>

<p>{sx}</p>
<p>{await slow(s)}</p>
