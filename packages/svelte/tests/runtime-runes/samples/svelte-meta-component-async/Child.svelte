<script>
	let x = $derived(await Promise.resolve('child'));
</script>

<section>{x}</section>
