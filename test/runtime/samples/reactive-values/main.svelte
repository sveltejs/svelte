<script>
	export let a = 1;
	export let b = 2;
	export let c;
	export let cSquared;

	$: c = a + b;
	$: cSquared = c * c;
</script>

<p>{a} + {b} = {c}</p>
<p>{c} * {c} = {cSquared}</p>