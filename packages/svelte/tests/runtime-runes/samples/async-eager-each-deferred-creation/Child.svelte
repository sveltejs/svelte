<script>
	$effect.pre(() => {
		console.log('setup');

		return () => console.log('teardown');
	});
</script>

<p>child</p>
