<script>
	let a = $state(0);
	$effect(() => {
		a = 1;
	});
</script>

{a}
