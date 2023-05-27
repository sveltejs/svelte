<script>
	let q = 2;
	let p = 3;
  switch (q) {
		case 1:
		  let value = Math.floor(Math.random()); // gives 0
			p = 4 + value;
			break;
		case 2:
		  var number = Math.ceil(Math.random()); // gives 1
		  p = 4 + number;
		  break;
		case 3:
		  const foo = 2; // gives 2
		  p = 4 + foo;
      break;
	}
</script>

<p>
	{p}
</p>

