<script>
	let x = 0;
	let y = 1;

	x += 1;

	{
		x += 2;
	}

	setTimeout(function foo() {
		x += 10;
		y += 20;
	}, 1000);

	$: x += y;
</script>

<p>x: {x}</p>
