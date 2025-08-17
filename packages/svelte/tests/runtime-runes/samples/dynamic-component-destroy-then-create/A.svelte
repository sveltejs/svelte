<script>
	$effect.pre(() => {
		console.log('create A');
		return () => console.log('destroy A');
	});
</script>

<h1>A</h1>
