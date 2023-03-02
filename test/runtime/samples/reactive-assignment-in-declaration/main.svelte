<script>
	let foo;
	let bar = (foo = 1);
	function a() {
		bar = (foo = 1);
	}
</script>

<h1>{foo} {bar}</h1>
