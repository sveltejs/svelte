<script>
	let { item } = $props();
	$effect(() => {
		console.log('mount ' + item);
		return () => console.log('destroy ' + item);
	});
</script>

<span>{item}</span>
