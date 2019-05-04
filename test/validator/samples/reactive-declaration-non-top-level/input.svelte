<script>
	let num = 2;
	$: square = num * num;

	function myFunc() {
		$: double = num * 2;
	}
</script>
