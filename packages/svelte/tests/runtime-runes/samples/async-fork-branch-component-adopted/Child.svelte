<script>
	let { f, n } = $props();
	let x = $derived(await f(n));
</script>

<p>{n}|{x}</p>
