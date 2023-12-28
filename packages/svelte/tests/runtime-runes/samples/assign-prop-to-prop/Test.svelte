<script>
	let z = 8;
	let { a, b = a, c = b * b, d = z * b + c } = $props();
</script>

<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>