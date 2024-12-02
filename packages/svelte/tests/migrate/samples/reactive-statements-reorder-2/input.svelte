<script>
	let width = 0;
	$: console.log(mobile);
	$: mobile = width < 640;
</script>

{width / mobile}
