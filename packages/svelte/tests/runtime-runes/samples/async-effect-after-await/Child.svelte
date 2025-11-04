<script>
	$effect(() => {
		console.log('before');
	});

	await 1;

	$effect(() => {
		console.log('after');
	});
</script>
