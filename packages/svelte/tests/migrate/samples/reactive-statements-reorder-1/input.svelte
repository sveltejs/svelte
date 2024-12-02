<script>
	$: mobile = width < 640;
	$: x = !mobile;
	let width = 0;
</script>

{width / mobile / x}
