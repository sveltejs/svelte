<script>
	$: $$restProps.a = $$restProps.a * 2;
</script>

<p>{$$restProps.a} {$$restProps.b}</p>
<button on:click={() => $$restProps.b = 'b'}>update</button>
