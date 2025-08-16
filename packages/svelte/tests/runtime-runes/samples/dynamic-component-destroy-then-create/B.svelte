<script>
	$effect.pre(() => {
		console.log('create B');
		return () => console.log('destroy B');
	});
</script>

<h1>B</h1>
