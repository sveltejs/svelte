<script>
	let { a, b, c, slow, track } = $props();
	let sa = $derived(await slow(a));
</script>

<p>{sa}</p>
<p>{await slow(b + c)}</p>
<p>{await track(sa, b, c)}</p>
