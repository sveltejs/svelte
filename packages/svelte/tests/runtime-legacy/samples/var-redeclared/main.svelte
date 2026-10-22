<script>
	var test = "";
	var test = 42;

	var { a, b: [c] } = { a: 1, b: [2] };
	var { a, b: [c] } = { a: 3, b: [4] };
</script>

<p>{test} {a} {c}</p>
