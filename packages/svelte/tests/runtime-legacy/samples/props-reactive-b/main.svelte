<script>
	export let a;
	$: c = a + $$props.b;
</script>

<p>a: {a}</p>
<p>b: {$$props.b}</p>
<p>c: {c}</p>
