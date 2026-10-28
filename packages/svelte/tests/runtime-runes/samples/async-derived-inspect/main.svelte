<script>
	let n = $state(1);
	const v = $derived(await Promise.resolve(n * 2));
	const doubled = $derived(v * 2);
	$inspect(v).with((type, v) => console.log('v', type, v));
	$inspect(doubled).with((type, v) => console.log('doubled', type, v));
</script>

<button onclick={() => n++}>{v}</button>
