<script>
	let { text } = $props();
	$effect(() => {
		console.log(text);
	});
</script>

<p>{text}</p>
