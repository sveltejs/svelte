<script>
	$: c = a + b;
	$: a = 2;
	$: b = a;
</script>

<p>{a}+{b}={c}</p>
