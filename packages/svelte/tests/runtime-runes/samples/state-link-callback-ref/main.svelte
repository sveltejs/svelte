<script>
	let a = $state(0);
	let b = $state.link(a, (value) => {
		if (c) return;
		b = value;
	});
	let c = $state(false);

	console.log(b);
	a++;
	console.log(b);
	b++;
	console.log(b);
	c = true;
	console.log(b);
	a++;
	console.log(b);
	b++;
	console.log(b);
</script>

