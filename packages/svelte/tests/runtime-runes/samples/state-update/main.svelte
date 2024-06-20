<script>
	let x = $state(0);
	let o = $state({ x: 0 });

	console.log(++x);
	console.log(x++);
	console.log(++o.x);
	console.log(o.x++);
</script>
