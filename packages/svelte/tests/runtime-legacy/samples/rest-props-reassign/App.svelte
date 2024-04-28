<script>
	$: $$restProps.c = $$restProps.c ?? 'c';
</script>

<p>{$$restProps.a} {$$restProps.b} {$$restProps.c}</p>
<button on:click={() => $$restProps.b = 'b'}>update</button>
